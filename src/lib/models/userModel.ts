//src/lib/models/userModel.ts

/*
ユーザーモデル操作の定義
*/

//Drizzleラップしたdbオブジェクトをインポート
import { db } from "@/lib/config/db/db";
//Drizzleスキーマをインポート
import { users } from "@/lib/config/db/schema/users";
//Drizzle操作モジュールをインポート
import { eq } from 'drizzle-orm';

export const createUser = async (email: Text, passwordHash: Text) => {
    try {
        const result = await db.insert(users).values({
            email: email, password: passwordHash
        })
        return result.rows[0]; //クエリ結果の一番目の値(クエリで作成されたDB行)
    } catch (error) {
        console.error("Error in createUser function:", error);
        throw error; // 呼び出し元でキャッチされるようにエラーを再スロー
    }
}

export const findUserByEmail = async (email: Text) => {
    try {
        const result = await db.select().from(users).where(eq(users.email, email))
        return result.rows[0]; //検索結果の一番目の値(検索したemailに該当するDB行)
    } catch (error) {
        console.error("Error in findUserByEmail function:", error);
        throw error;
    }
}