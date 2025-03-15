import type { SqlError } from '@effect/sql/SqlError';
import { Database } from '@/backend/db/db';
import { sessions, users } from '@/backend/db/db';
import { eq } from 'drizzle-orm';
import { Duration, Effect, Option, Redacted, pipe } from 'effect';
import { NoSuchElementException } from 'effect/Cause';
import { hash, verify } from 'argon2';
export namespace User {
	export const PasswordEmptyError = { _tag: 'PasswordEmptyError' } as const;
	export type PasswordEmptyError = typeof PasswordEmptyError;

	/**
	 * Checks if the provided password matches the password hash
	 */
	export const validatePassword: (
		passwordHash: string,
		password: Redacted.Redacted<string>,
	) => Effect.Effect<boolean> = (passwordHash, password) =>
		Effect.tryPromise(() =>
			verify(passwordHash, Redacted.value(password)),
		).pipe(Effect.orElseSucceed(() => false));

	/**
	 * Hashes a password
	 * @returns An effect that hashes the password or throws an {@link PasswordEmptyError error} if the password is empty
	 */
	export const hashPassword: (
		password: Redacted.Redacted<string>,
	) => Effect.Effect<string, PasswordEmptyError> = password =>
		Effect.tryPromise(() => hash(Redacted.value(password))).pipe(
			Effect.mapError(_ => PasswordEmptyError),
		);

	export function findUser(
		email: string,
		password = Option.none<Redacted.Redacted<string>>(),
	) {
		return pipe(
			// Fazemos uma query para o banco de dados
			Database.pipe(
				Effect.andThen(db =>
					db.select().from(users).where(eq(users.email, email)),
				),
				Effect.map(([user]) => user as User | undefined),
				Effect.withSpan('checkUserLogin', {
					attributes: { email },
				}),
			),
			Effect.andThen(user =>
				user
					? Option.match(password, {
							onSome: password =>
								pipe(
									validatePassword(user.password!, password),
									Effect.if({
										onTrue: () => Effect.succeed(user),
										onFalse: () => Effect.fail(new NoSuchElementException()),
									}),
								),
							onNone: () => Effect.succeed(user),
						})
					: Effect.fail(new NoSuchElementException()),
			),
		);
	}

	export function fetch(
		id: string,
	): Effect.Effect<User, SqlError | NoSuchElementException, Database> {
		return Effect.gen(function* () {
			const db = yield* Database;
			const [user] = yield* db.select().from(users).where(eq(users.id, id));
			return yield* Effect.fromNullable(user);
		});
	}

	export function loginUser(
		email: string,
		password: Redacted.Redacted<string>,
	) {
		return pipe(
			findUser(email, Option.some(password)),
			// Verificar que o usuário existe
			Effect.andThen(Effect.fromNullable),
			// Criar a sessão
			Effect.andThen(user =>
				Database.pipe(
					Effect.andThen(db =>
						db.insert(sessions).values({ userId: user.id }).returning(),
					),
					Effect.map(([sessao]) => sessao),
				),
			),
			Effect.tapError(e => Effect.logError(e)),
			Effect.withSpan('loginUser', { attributes: { email } }),
			Effect.timeout(Duration.seconds(10)),
		);
	}

	export const createUser: (
		options: NewUser,
	) => Effect.Effect<User, PasswordEmptyError | SqlError, Database> = options =>
		Effect.gen(function* () {
			const db = yield* Database;
			return (yield* db
				.insert(users)
				.values({
					...options,
					password: yield* hashPassword(options.password),
				})
				.returning())[0];
		}).pipe(Effect.withSpan('createUser'));
	export type User = typeof users.$inferSelect;
	export type NewUser = Omit<typeof users.$inferInsert, 'password'> & {
		password: Redacted.Redacted<string>;
	};
}
