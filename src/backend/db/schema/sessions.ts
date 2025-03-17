import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { DateTime, Duration, Effect, pipe } from 'effect';
import { dates, idColumn } from '../helpers/columns';
import { users } from './users';
import { Schema } from 'effect';
import { idSchema } from '../helpers/idGenerator';

export const sessions = pgTable('sessions', {
	id: idColumn('se').primaryKey(),
	userId: text()
		.references(() => users.id)
		.notNull(),
	expiresAt: timestamp({ mode: 'string' })
		.notNull()
		.$defaultFn(() =>
			pipe(
				DateTime.now,
				Effect.runSync,
				DateTime.addDuration(Duration.weeks(2)),
				DateTime.toDateUtc,
				String,
			),
		),
	...dates,
});
export const SessionSchema = Schema.Struct({
	id: idSchema("se", "session"),
	userId: idSchema("us", "user"),
	expiresAt: Schema.String,
	createdAt: Schema.String,
	updatedAt: Schema.String,
}).annotations({
	description: "Session"
});