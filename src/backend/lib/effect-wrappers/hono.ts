import { Effect } from 'effect';
import type * as hono from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { JSONValue } from 'hono/utils/types';

export namespace HonoEffect {
	export namespace Req {
		/**
		 * Fetches a variable from the environment
		 */
		export function get<
			E extends hono.Env,
			P extends string,
			I extends hono.Input,
		>(c: hono.Context<E, P, I>, name: keyof E['Variables']) {
			return Effect.sync(() => c.get(name));
		}
		/**
		 * Sets a variable into the environment
		 */
		export function set<
			Key extends keyof E['Variables'],
			E extends hono.Env,
			P extends string,
			I extends hono.Input,
		>(c: hono.Context<E, P, I>, name: Key) {
			return Effect.map((value: E['Variables'][Key]) => c.set(name, value));
		}
		/**
		 * Parses the request body as JSON and returns it wrapped in an Effect.
		 */
		export function json<
			T,
			E extends hono.Env,
			P extends string,
			I extends hono.Input & { out: { json: T } },
		>(c: hono.Context<E, P, I>) {
			return Effect.sync(() => c.req.valid('json'));
		}

		/**
		 * Retrieves a specific header from the request and returns it wrapped in an Effect.
		 */
		export function header<
			E extends hono.Env,
			P extends string,
			I extends hono.Input,
		>(c: hono.Context<E, P, I>, headerName: string) {
			return Effect.sync(() => c.req.header(headerName)).pipe(
				Effect.andThen(Effect.fromNullable),
			);
		}

		/**
		 * Retrieves a specific parameter from the request and returns it wrapped in an Effect.
		 */
		export function param<
			E extends hono.Env,
			P extends string,
			I extends hono.Input,
		>(c: hono.Context<E, P, I>, paramName: string) {
			return Effect.sync(() => c.req.param(paramName)).pipe(
				Effect.andThen(Effect.fromNullable),
			);
		}

		/**
		 * Retrieves a specific query parameter from the request and returns it wrapped in an Effect.
		 */
		export function query<
			E extends hono.Env,
			P extends string,
			I extends hono.Input,
		>(c: hono.Context<E, P, I>, queryName: string) {
			return Effect.sync(() => c.req.query(queryName)).pipe(
				Effect.andThen(Effect.fromNullable),
			);
		}
	}

	export namespace Res {
		/**
		 * Sends a JSON response using the provided Hono context.
		 */
		export function sendJson<T extends JSONValue>(
			c: hono.Context,
			json: T,
			statusCode: ContentfulStatusCode = 200,
		) {
			return Effect.sync(() => c.json(json, statusCode));
		}

		/**
		 * Sends a text response using the provided Hono context.
		 */
		export function sendText(
			c: hono.Context,
			text: string,
			statusCode: ContentfulStatusCode = 200,
		) {
			return Effect.sync(() => c.text(text, statusCode));
		}

		/**
		 * Sends an empty response with a 204 status code using the provided Hono context.
		 */
		export function empty(c: hono.Context) {
			return Effect.sync(() => {
				c.status(204);
				c.body(null);
			});
		}
	}
}
