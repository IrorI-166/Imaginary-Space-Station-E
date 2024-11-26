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
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    alt="Your Company"
                    src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
                    className="mx-auto h-10 w-auto"
                />
                <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                    {buttonLabel === "Register" ? "Create your account" : "Sign in to your account"}
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                placeholder="Enter your email"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                            Password
                        </label>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            {buttonLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountAuthForm;