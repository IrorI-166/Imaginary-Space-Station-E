//src/app/register/page.tsx

//クライアントサイドで使用することを定義
"use client";

import AccountAuthForm from "@/components/AccountAuthForm";

export default function RegisterPage() {
    return (
        <AccountAuthForm
            action="/api/auth/register"
            buttonLabel="Register"
            onSuccess={(response) => console.log("Success:", response)
            }
            onError={(error) => console.error("Error:", error)}
        />
    );
}