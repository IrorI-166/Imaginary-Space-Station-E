import { randomBytes } from 'node:crypto';
import { Schema } from "effect";
export const DEFAULT_MAX_ID_SIZE = 12;

export function generateRandomId(
	prefix: string,
	size = DEFAULT_MAX_ID_SIZE,
): string {
	const randomString =
		randomBytes(size / 2).toString('hex') + (+new Date()).toString(16);
	return `${prefix}_${randomString}`;
}

export function idGenerator(prefix: string, length?: number): () => string {
	return () => generateRandomId(prefix, length);
}

export function idSchema(prefix: string, resourceName: string, length?: number) {
	return Schema.String.pipe(Schema.startsWith(`${prefix}_`)).annotations({
		description: `Randomly generated ID that uniquely identifies the ${resourceName}`,
		examples: [
			generateRandomId(prefix, length)
		]
	})
}