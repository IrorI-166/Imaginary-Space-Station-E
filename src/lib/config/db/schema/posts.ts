//lib/config/db/schema/posts.ts

//Post情報テーブルの定義
import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { get } from "http";
import { users } from "./users";

export const posts = pgTable('posts', {
    postId: serial().notNull().primaryKey().generatedAlwaysAsIdentity(),
    authorId: get(users.uuid).notNull(),
    content: text().notNull()
});