//src/lib/config/db/db.ts

//DrrizleとPstgresSQLをインポート
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

/*
potyは数値型が推論されるが、process.env.DATABASE_PORTはstring | undefined型になるため、
parseInt関数でInt型にキャストする
"10"で10進数として解釈
"5432"->5432になる
.envファイルに設置が存在しない場合の安全策にデフォルト値をでってい
*/
const port = process.env.DATABASE_PORT 
    ? parseInt(process.env.DATABASE_PORT, 10) 
    : 5432;

//Poolオブジェクトを定義、envファイルの情報からPostgresに接続
const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: port
});

//drrizleでラップしてエクスポート
export const db = drizzle(pool);