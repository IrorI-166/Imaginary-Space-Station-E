//lib/config/db/schema/antennas.ts

import { pgTable, serial, text, uuid } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
    uuid: uuid("uuid").defaultRandom().notNull().unique().primaryKey(), // UUID 型で一意の ID
    antennaId: serial().notNull(),
    antennaName: text().notNull()
});