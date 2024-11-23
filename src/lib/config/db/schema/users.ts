//lib/config/db/schema/users.ts

//usersテーブルの定義
import { pgTable, serial, varchar, timestamp, uuid } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
    tableId: serial("table_id").notNull().primaryKey(),
    uuid: uuid("uuid").defaultRandom().notNull().unique(), // UUID 型で一意の ID
    email: varchar("email", { length: 255 }).notNull().unique(), // メールアドレス
    password: varchar("password", { length: 255 }).notNull(), // ハッシュ化されたパスワード
    registeredAt: timestamp("registered_at").defaultNow().notNull(), // 登録日時
});