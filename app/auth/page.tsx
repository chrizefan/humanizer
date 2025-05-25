import { Metadata } from "next";
import AuthForm from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Authentication - AI Humanizer",
  description: "Sign in or create an account to use AI Humanizer.",
};

export default function AuthPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 bg-gradient-to-br from-[#f0f4f9] via-white to-[#e8f0fe] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-[440px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        <AuthForm />
      </div>
    </div>
  );
}