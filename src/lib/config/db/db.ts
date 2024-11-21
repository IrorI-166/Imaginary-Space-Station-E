//lib/config/db/db.ts

//DrrizleとPstgresSQLをインポート
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

//Poolオブジェクトを定義、envファイルの情報からPostgresに接続
const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT || 5432,
});

//drrizleでラップしてエクスポート
export const db = drizzle(pool);