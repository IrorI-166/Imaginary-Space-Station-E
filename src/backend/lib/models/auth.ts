import type { SqlError } from '@effect/sql/SqlError';
import { UserFeatures } from '../features';
import { sessions } from '@/backend/db/schema/sessions';
import { Database, DatabaseLive } from '@/backend/db/db';
import { eq } from 'drizzle-orm';
import { Data, Effect, Logger, pipe } from 'effect';
import type { NoSuchElementException } from 'effect/Cause';
import { createMiddleware } from 'hono/factory';
import { HonoEffect } from '../effect-wrappers/hono';
import { runPromiseSafe } from '../effect-wrappers/safePromise';
import { User } from './user';

export namespace Token {
	export interface UserToken {
		readonly kind: 'user';
		readonly token: string;
	}
	export type Token = UserToken;

	export class UnknownTokenKind extends Data.TaggedError('UnknownTokenKind') {}

	export const processAuthorizationHeader: (
		authorizationHeader: string,
	) => Effect.Effect<Token.Token, UnknownTokenKind> = authorizationHeader =>
		Effect.gen(function* () {
			const parts = authorizationHeader.split(' ', 2);
			if (parts.length !== 2 || parts[0] !== 'Bearer') {
				return yield* new UnknownTokenKind();
			}
			const token = parts[1];
			if (token.startsWith('se_')) return { kind: 'user', token: token };
			return yield* new UnknownTokenKind();
		});
}

export namespace Session {
	export type Session = typeof sessions.$inferSelect;
	export type NewSession = typeof sessions.$inferInsert;
	/**
	 * This an error that is thrown whenever a expired session is retrieved
	 */
	export class SessionExpired extends Data.TaggedError('SessionExpired') {}

	/**
	 * Fetches a session by ID.
	 *
	 * It also checks if the session expired or not and returns a `SessionExpired` error instead.
	 * Returns a `NoSuchElementException` if the session was not found.
	 */
	export function retrieve(
		sessionId: string,
	): Effect.Effect<
		Session,
		SqlError | NoSuchElementException | SessionExpired,
		Database
	> {
		return pipe(
			Effect.gen(function* () {
				const db = yield* Database;
				const resultSet = yield* db
					.select()
					.from(sessions)
					.where(eq(sessions.id, sessionId));
				return resultSet[0];
			}),
			Effect.flatMap(Effect.fromNullable),
			Effect.andThen(
				Effect.liftPredicate(
					session => new Date() < new Date(session.expiresAt),
					() => new SessionExpired(),
				),
			),
			Effect.withSpan('Session.retrieve', { attributes: { sessionId } }),
		);
	}
	/**
	 * Fetches a user from a session
	 * @see {@link retrieve} for more details about the errors
	 * @param userToken A session ID
	 */
	export function findUserFromSessionId(
		userToken: Token.UserToken,
	): Effect.Effect<
		{ user: User.User; session: Session },
		SqlError | NoSuchElementException | SessionExpired,
		Database
	> {
		return pipe(
			userToken.token,
			retrieve,
			Effect.andThen(session =>
				Effect.gen(function* () {
					return { session, user: yield* User.fetch(session.userId) };
				}),
			),
			Effect.withSpan('findUserFromSessionId'),
		);
	}
}

export namespace Middleware {
	export interface AnonymousAuthenticationResult {
		readonly kind: 'anonymous';
		readonly session: null;
		readonly user: null;
	}
	export interface UserAuthenticationResult {
		readonly kind: 'user';
		readonly session: Session.Session;
		readonly user: User.User;
	}

	/**
	 * Represents the output of the authentication middleware.
	 *
	 * It can be the result of authenticating a user from a session id, or a
	 * workspace through a private key or even an anonymous user when neither
	 * are found.
	 */
	export type AuthenticationResult =
		| UserAuthenticationResult
		| AnonymousAuthenticationResult;

	export const authenticateToken = (token: Token.Token) =>
		Effect.gen(function* () {
			if (token.kind === 'user') {
				const { session, user } = yield* Session.findUserFromSessionId(token);
				return {
					kind: 'user',
					session,
					user
				} satisfies UserAuthenticationResult;
			}
			return yield* new Token.UnknownTokenKind();
		}).pipe(
			Effect.withSpan('authenticateToken', {
				attributes: { tokenKind: token.kind },
			}),
		);
	class TokenNotFound extends Data.TaggedError('TokenNotFound') {}

	/**
	 * Authentication middleware
	 *
	 * This is the middleware that identifies the user, do not confuse with authorization middleware.
	 * authorization middleware is the one that checks if the user has the permission to access a resource while
	 * authentication middleware is the one that identifies the user.
	 * @example
	 * hono.get(
	 *   "/user",
	 *    Middleware.authentication,
	 *    async (c) => {
	 *      return c.json(c.get("authenticationResult").user)
	 *    }
	 * )
	 *
	 * @see {@link AuthenticationResult}
	 */
	export const authentication = createMiddleware<{
		Variables: { authenticationResult: AuthenticationResult };
	}>((c, next) =>
		pipe(
			HonoEffect.Req.header(c, 'Authorization'),
			Effect.matchEffect({
				onSuccess: token =>
					pipe(
						Token.processAuthorizationHeader(token),
						Effect.andThen(authenticateToken),
					).pipe(
						Effect.catchTag('NoSuchElementException', _ =>
							Effect.fail(new TokenNotFound()),
						),
					),
				onFailure: _ =>
					Effect.succeed({
						kind: 'anonymous',
						session: null,
						user: null
					} satisfies AnonymousAuthenticationResult),
			}),
			HonoEffect.Req.set(c, 'authenticationResult'),
			Effect.andThen(_ => Effect.promise(() => next())),
			Effect.provide(DatabaseLive),
			Effect.catchTags({
				TokenNotFound: _ =>
					HonoEffect.Res.sendJson(
						c,
						{
							message: 'Token does not exist',
							help: "Check if the 'Authorization' header is correct",
							code: 'TOKEN_NOT_FOUND',
						},
						404,
					),
				SessionExpired: _ =>
					HonoEffect.Res.sendJson(
						c,
						{
							message: 'Session already expired',
							help: 'Try logging in again',
							code: 'SESSION_EXPIRED',
						},
						410,
					),
				UnknownTokenKind: _ =>
					HonoEffect.Res.sendJson(
						c,
						{
							message: 'Unknown kind of token',
							help: "Check if the 'Authorization' header is correct",
							code: 'UNKNOWN_TOKEN_KIND',
						},
						400,
					),
			}),

			Effect.withSpan('authentication middleware', {
				attributes: { route: c.req.path },
			}),
			Effect.catchTags({
				SqlError: e =>
					HonoEffect.Res.sendJson(
						c,
						{
							message: 'Failed to access database',
							code: 'DATABASE_ERROR',
							error: e,
						},
						500,
					),
			}),
			Effect.provide(Logger.pretty),
			runPromiseSafe,
		),
	);
	export const checkUserFeatures = (
		authResult: AuthenticationResult | undefined,
		requiredUserFeatures: UserFeatures.Feature[],
	) => {
		const userFeatures = authResult?.kind == "user" ? new Set(authResult.user.features) : UserFeatures.ANONYMOUS_FEATURES;
		return userFeatures.isSupersetOf(new Set(requiredUserFeatures));
	};

	export const authorization = (options: {
		requiredUserFeatures?: UserFeatures.Feature[];
	}) =>
		createMiddleware<{
			Variables: { authenticationResult: AuthenticationResult };
		}>((c, next) =>
			Effect.promise(async () => {
				const authResult = c.get('authenticationResult') as
					| AuthenticationResult
					| undefined;
				if (
					options.requiredUserFeatures &&
					!checkUserFeatures(authResult, options.requiredUserFeatures)
				) {
					return c.json(
						{
							message: `User does not have the required permissions: ['${options.requiredUserFeatures.join("', '")}']`,
							code: 'USER:FORBIDDEN',
						},
						403,
					);
				}
				await next();
			}).pipe(
				Effect.withSpan('authorization middleware', {
					attributes: { route: c.req.path },
				}),
				Effect.provide(Logger.pretty),
				runPromiseSafe,
			),
		);
}
