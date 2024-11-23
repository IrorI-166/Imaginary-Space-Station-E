//src/lib/config/redisClient.ts

/*
Redis接続モジュールの定義とそのエクスポート
*/

//Redisのインポート
import redis from "redis";

//環境変数からRedisURLをロード
const redisURL = process.env.REDIS_URL;
if (!redisURL) {
    throw new Error("Missing environment variable: REDIS_URL");
}

export const client = redis.createClient({
    url: redisURL
});

//クライアントをRedisに接続
(async () => {
    try {
        await client.connect(); // 非同期で接続を確立
        console.log("Connected to Redis");
    } catch(error) {
        console.error("Redis connection error:", error);
    }
})();

//エラー発生時のログ
client.on('error', (err) => {
    console.error('Redis error:', err);
});