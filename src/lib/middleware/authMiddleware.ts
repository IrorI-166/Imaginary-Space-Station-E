//src/lib/middleware/authMiddleware.ts

/*
アクセス認証ミドルウェアの定義
*/
//各モジュールのインポート
import jwt from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from "next";
//Redisクライアントのインポート
import { client } from "@/lib/config/redisClient"

//Redis クライアントの初期化
client.on("connect", () => console.log("Connected to Redis by Middleware"));
client.on("error", (err) => console.error("Redis error:", err));

// 型拡張：NextApiRequest に userId を追加
declare module "next" {
    interface NextApiRequest {
        userId?: string;
    }
}

// JWT トークンを非同期で検証するヘルパー関数
const verifyToken = (token: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
            if (err) reject(err);
            else resolve(decoded);
        });
    });
};

// authMiddleware関数: 認証用のミドルウェアを定義
// オブジェクト:
// req: クライアントから送信されるHTTPリクエストオブジェクト
// res: HTTPレスポンスオブジェクト。JSON形式で返す
export const authMiddleware = async (
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void | NextApiResponse> => {
    try {
        // リクエストメソッドの検証
        if (req.method !== "GET") {
            console.warn("Unauthorized access attempt: Non-GET request");
            return res.status(405).json({ error: "Method Not Allowed" });
        }

        // Authorization ヘッダーからトークンを取得
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Missing Authorization Token" });
        }

        //検証用
        console.log("Token from request:", token);

        // トークンの有効性を検証
        // JWT トークンを検証
        const decoded = await verifyToken(token);
        console.log("Decoded JWT payload:", decoded);

        // Redis クライアントが閉じている場合は再接続を試みる
        if (!client.isOpen) {
            console.log("Redis client is not connected. Reconnecting...");
            await client.connect();
        }

        // Redisからトークンを取得
        /*
        keyを引数に受け取ってredis上に保存されたトークンを受け取る。
        トークンが存在しない場合、もしくはトークンが違っている場合、401ステータスを返す
        */
        const redisKey = `user:${decoded.userId}`;
        console.log("Generated Redis key:", redisKey);

        const redisToken = await client.get(redisKey);
        console.log("Redis token for user:", redisToken);

        //トークンが存在しないもしくは一致しない場合
        if (!redisToken || redisToken !== token) {
            console.warn("Session expired or token mismatch");
            return res.status(401).json({ error: "Session Expired or Invalid Token" });
        }

        // 認証成功：リクエストに userId を設定
        req.userId = decoded.userId;
    } catch (error) {
        console.error("Error in authMiddleware:", error);

        // JWT トークンエラーの場合の対応
        if (error instanceof jwt.JsonWebTokenError) {
            return res
                .status(401)
                .json({ error: "Invalid or Expired Authorization Token" });
        }

        // その他のエラー
        return res.status(500).json({ error: "Internal Server Error" });
    }
}