//src/components/RegisterForm.tsx
/*
アカウント認証フォームのコンポーネントを定義
*/

//クライアントサイドで使用することを定義
"use client";

//モジュールインポート
import React, { useState } from "react";

//TypeScript Interfaceでコンポーネントが受け取るプロパティを定義
/*
AccountAuthFormコンポーネントが期待するプロパティ
action: API エンドポイントを指定
buttonLabel: フォーム送信ボタンに表示する文字列を指定
onSuccess: API リクエストが成功した際に呼び出されるコールバック関数を受け取る
onError: API リクエストがエラーになった際に呼び出されるコールバック関数を受け取る
*/
interface AccountAuthFormProps {
    action: "/api/auth/register" | "/api/auth/login"; // APIエンドポイント
    buttonLabel: string; // ボタンのラベル
    onSuccess?: (response: any) => void; // 成功時のコールバック
    onError?: (error: any) => void; // エラー時のコールバック
}

/*
認証フォームを提供するReactコンポーネントを定義

*/
const AccountAuthForm: React.FC<AccountAuthFormProps> = ({
    action,
    buttonLabel,
    onSuccess,
    onError,
}) => {
    /*
    状態管理
    内部状態を管理する変数を定義
    */
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    /*
    フォーム送信時の処理
    */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // デフォルトのページリロードを防止
        setLoading(true); // ローディング状態に
        setErrorMessage(""); // 過去のエラーメッセージをクリア

        try {
            // API リクエストの送信
            const response = await fetch(action, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                // エラー処理
                throw new Error("Request failed");
            }

            // レスポンスのパース
            const data = await response.json();
            setLoading(false);

            // 成功時の処理
            if (onSuccess) {
                onSuccess(data); // 成功時のカスタム処理
            } else {
                alert("Operation successful!");
            }
        } catch (error: any) {
            setLoading(false); // ローディング状態を終了
            setErrorMessage(error.message); // エラーメッセージを設定

            if (onError) {
                onError(error); // エラー時のカスタム処理
            } else {
                alert("Operation failed.");
                console.error(error);
            }
        }
    }

    // レンダリング
    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg space-y-6"
        >
            {/* エラーメッセージ */}
            {errorMessage && (
                <p className="text-red-500 text-sm font-medium">
                    {errorMessage}
                </p>
            )}

            {/* メールアドレス入力 */}
            <div className="flex flex-col">
                <label htmlFor="email" className="mb-2 text-gray-700 font-medium"></label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            {/* パスワード入力 */}
            <div className="flex flex-col">
                <label htmlFor="password" className="mb-2 text-gray-700 font-medium"></label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            {/* サブミットボタン */}
            <button
                type="submit"
                disabled={loading}
                className="w-full p-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
            >
                {loading ? "Loading..." : buttonLabel}
            </button>
        </form>
    );
};

export default AccountAuthForm;
