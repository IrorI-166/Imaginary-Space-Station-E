//lib/config/db/schema/posts.ts

//Post情報テーブルの定義
import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const posts = pgTable('posts', {
    postId: serial().notNull().primaryKey(),
    content: text().notNull()
});