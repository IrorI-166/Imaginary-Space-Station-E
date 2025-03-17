import { Effect } from 'effect';
/**
 * Converts an Effect to a Promise, making sure all errors are handled.
 *
 * It requires that the `E` type parameter is never, forcing all errors
 * to be handled before calling this function
 *
 * @example
 * pipe(
 *   myEffect,
 *   runPromiseSafe // Makes sure all errors are handled
 * );
 */
export const runPromiseSafe: <A>(
	effect: Effect.Effect<A, never, never>,
	options?: { readonly signal?: AbortSignal } | undefined,
) => Promise<A> = Effect.runPromise;
