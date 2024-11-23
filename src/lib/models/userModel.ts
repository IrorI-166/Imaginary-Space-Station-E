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

// 型定義：ユーザーの挿入結果
export interface UserInsertResult {
    tableId: number; // シリアル ID
    uuid: string; // UUID 型の一意 ID
    email: string; // メールアドレス
    password: string; // ハッシュ化されたパスワード
    registeredAt: Date; // 登録日時
}

export const createUser = async (email: string, passwordHash: string) => {
    try {
        const result = await db.insert(users).values({
            email: email,
            password: passwordHash
        }).returning()
        return result; //作成されたユーザー情報を返す
    } catch (error) {
        console.error("Error in createUser function:", error);
        throw new Error("Failed to create user"); //呼び出し元でキャッチされるようにエラーを再スロー
    }
}

export const findUserByEmail = async (email: string) => {
    try {
        const [result] = await db.select().from(users).where(eq(users.email, email));

        // ユーザーが見つからない場合は null を返す
        if (!result) {
            console.warn(`User with email ${email} not found`);
            return null;
        }

        return result;
    } catch (error) {
        console.error("Error in findUserByEmail function:", error);
        throw new Error("Failed to find user by email");
    }
}