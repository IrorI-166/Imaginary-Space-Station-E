//src/app/api/auth/register/route.ts

/*
新規ユーザー登録を行う非同期関数registerを定義
*/
//モジュールのインポート
import bcrypt from "bcryptjs";
//NextJS ServerにおけるHTTPリクエスト、レスポンスオブジェクトのインポート
import { NextRequest, NextResponse } from "next/server";
//createUserの呼び出し
import { createUser } from "@/lib/models/userModel";

// POST メソッド用エンドポイントの定義
export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        // リクエストのボディからemailとpasswordを取得
        const { email, password } = await req.json();;

        // 必須項目の確認
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // パスワードをハッシュ化（10はソルトのラウンド数）
        //DB漏洩防止策：漏洩してもハッシュ値なのでパスワードはバレない
        const passwordHash = await bcrypt.hash(password, 10);
        // createUser関数を使ってemailとハッシュ化されたパスワードでユーザー情報をDBに保存
        const user = await createUser(email, passwordHash);

        // ユーザー登録成功のレスポンスを返す
        //status:HTTPステータスコードを設定するメソッド。
        //json:レスポンスをJson形式のデータで送信するメソッド。オブジェクトや配列をクライアントに返す。
        //HTTPステータスコード201:リソースが正常作成されたことを示す。
        return NextResponse.json(
            { message: "User registered successfully", user },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error in register function:", error);

        // 重複エラーの処理
        if (error instanceof Error && error.message.includes("duplicate key")) {
            return NextResponse.json(
                { error: "Email already exists" },
                { status: 409 }
            );
        }

        // サーバーエラー
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}