//lib/config/db/schema/users.ts

//usersテーブルの定義
import { pgTable, integer, serial, varchar, timestamp } from "drizzle-orm/pg-core"

export const users = pgTable('users', {
    tableId: serial().notNull().primaryKey(),
    uuid: integer().generatedAlwaysAsIdentity().notNull().unique(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 30}).notNull(),
    registered_at: timestamp().notNull()
});