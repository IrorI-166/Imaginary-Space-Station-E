import { jsonb, timestamp, varchar } from 'drizzle-orm/pg-core';
import { idGenerator } from './idGenerator';
import { UserFeatures } from '@/backend/lib/features';

export function idColumn(prefix: string, size?: number) {
	return varchar().notNull().$defaultFn(idGenerator(prefix, size));
}

export const dates = {
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date().toString()),
};

export const userFeaturesColumn = jsonb().$type<UserFeatures.Feature[]>();