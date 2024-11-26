//src/app/register/page.tsx

import AccountAuthForm from "@/components/AccountAuthForm";

export default function RegisterPage() {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-200">
            <AccountAuthForm action="/api/auth/register" buttonLabel="Register" />
        </div>
    );
}