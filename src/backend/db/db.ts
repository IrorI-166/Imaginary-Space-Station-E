import * as PostgresDrizzle from '@effect/sql-drizzle/Pg';
import { PgClient } from '@effect/sql-pg';
import { Config, Layer } from 'effect';
import Database = PostgresDrizzle.PgDrizzle;

const SqlLive = PgClient.layerConfig({
	url: Config.redacted(Config.string('DATABASE_URL')),
	ssl: Config.url('DATABASE_URL').pipe(
		Config.map(s => s.searchParams.get('sslmode') === 'require'),
	),
});
const DrizzleLive = PostgresDrizzle.layer.pipe(Layer.provide(SqlLive));
const DatabaseLive = Layer.mergeAll(SqlLive, DrizzleLive).pipe(Layer.orDie);

export { Database, DatabaseLive };

export * from "./schema/users";
export * from "./schema/sessions";