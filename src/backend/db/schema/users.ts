import { pgTable, text } from 'drizzle-orm/pg-core';
import { dates, idColumn, userFeaturesColumn } from '../helpers/columns';
import { Schema } from 'effect';
import { Email } from '@/backend/lib/emailValidator';
import { UserFeatures } from '@/backend/lib/features';
import { idSchema } from '../helpers/idGenerator';

export const users = pgTable('users', {
	id: idColumn('us').primaryKey(),
	name: text().notNull(),
	email: text().notNull(),
	password: text().notNull(),
	features: userFeaturesColumn.notNull(),
	...dates,
});

export const UserSchema = Schema.Struct({
	id: idSchema("us", "user"),
	name: Schema.String,
	email: Email.annotations({
		description: "User's email"
	}),
	password: Schema.optional(Schema.String),
	features: Schema.Array(UserFeatures.VALIDATOR).annotations({
		description: "User's features/permissions. This controls what kind of features the user can use and what permissions it has and different routes can require different features from the user to be able to execute them."
	}),
	createdAt: Schema.String,
	updatedAt: Schema.String,
}).annotations({
	description: "User"
});