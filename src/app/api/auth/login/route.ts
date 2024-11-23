//src/app/auth/login/route.ts

/*
ユーザーのログインを処理する非同期関数loginを定義
*/
//モジュールのインポート
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
//NextJS ServerにおけるHTTPリクエスト、レスポンスオブジェクトのインポート
import { NextRequest, NextResponse } from "next/server";
//findUserByEmailの呼び出し
import { findUserByEmail } from "@/lib/models/userModel";
//Redisクライアントのインポート
import { client } from "@/lib/config/redisClient";

// POST メソッド用エンドポイントの定義
export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        //検証
        console.log("Login function started");
        // リクエストのボディからemailとpasswordを取得
        const { email, password } = await req.json();

        // 必須項目の確認
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // emailでDBからユーザーを検索
        const user = await findUserByEmail(email);
        // ユーザーが見つからない場合、エラーレスポンスを返す
        if (!user) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // 入力されたパスワードとDBのハッシュ化されたパスワードを比較
        const isMatch = await bcrypt.compare(password, user.password);
        // パスワードが一致しない場合、エラーレスポンスを返す
        if (!isMatch) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // JWTトークンを生成し、ペイロードにユーザーIDを含め、1時間の有効期限を設定
        //sign:JWTトークンの生成。渡された引数をJWT（トークン）のペイロードとして設定してトークンを発行する。
        //{ userId: user.id }:トークンペイロードにuserIDを含めることを定義。
        /*
        process.env.JWT_SECRET:トークン生成に使う秘密鍵。envファイルから取得。
        クライアントには共有されず、トークンの改竄非改竄をサーバーが判別するために使われる。
        */
        const jwtPayload = { userId: user.uuid };
        // 環境変数から JWT シークレットを取得
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("JWT_SECRET is not defined");
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }
        const jwtOptions = {
            //algorithm: 'HS256',
            expiresIn: '1h',
        };
        let token: string;
        try {
            token = jwt.sign(jwtPayload, jwtSecret, jwtOptions);
        } catch (error) {
            console.error("Error generating JWT:", error);
            return NextResponse.json(
                { error: "Failed to generate token" },
                { status: 500 }
            );
        }

        // Redisにトークンを保存し、キーをユーザーID、値をトークン、1時間の有効期限を設定
        /*
        Redisのcilentインスタンスのsetex関数で、指定したキーに値を保存して有効期限を設定する。
        ログインセッションの時間を管理。
        user.idをキーとしてtokenを保存。有効期限は3600秒。
        */
        // Redisにトークンを保存（有効期限を設定）
        try {
            await client.set(`user:${user.uuid}`, token, { EX: 3600 });
            console.log(`Saved token in Redis: user:${user.uuid} -> ${token}`);
        } catch (error) {
            console.error("Error saving token to Redis:", error);
            return NextResponse.json(
                { error: "Failed to save token" },
                { status: 500 }
            );
        }

        // 保存したトークンを Redis から確認
        const redisCheck = await client.get(`user:${user.uuid}`);
        if (redisCheck !== token) {
            console.error("Redis token mismatch");
            return NextResponse.json(
                { error: "Server error during token validation" },
                { status: 500 }
            );
        }

        // ログイン成功のメッセージとトークンをレスポンスとして返す
        console.log("Login successful");
        return NextResponse.json(
            { message: "Login successful", token },
            { status: 201 }
        )
    } catch (error) {
        console.error("Error in login function:", error);

        // サーバーエラー
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}