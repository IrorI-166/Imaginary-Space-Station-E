import { Schema } from 'effect';

type ElementsOfSet<S> = S extends Set<infer T> ? T : never;

export namespace UserFeatures {
	export const ANONYMOUS_FEATURES = new Set([
		'session:create',
		'user:login',
	] satisfies Feature[]);
	export const AVAILABLE_FEATURES = new Set([
		'session:create',
		'session:delete',
		'user:login',
		"user:read",
		'nuked',
	] as const);
	export type Feature = ElementsOfSet<typeof AVAILABLE_FEATURES>;
	export const DEFAULT_FEATURES = new Set([
		'session:create',
		'session:delete',
		'user:login',
	] satisfies Feature[]);

	export const VALIDATOR = Schema.Union(
		...Array.from(
			AVAILABLE_FEATURES.keys().map((s: Feature) => Schema.Literal(s)),
		),
	);
}