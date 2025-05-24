import { Metadata } from "next";
import AuthForm from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Authentication - AI Humanizer",
  description: "Sign in or create an account to use AI Humanizer.",
};

export default function AuthPage() {
  return (
    <div className="flex items-center justify-center min-h-screen py-20 md:py-32 px-4 md:px-8 bg-gradient-to-br from-[#f0f4f9] via-white to-[#e8f0fe] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        <AuthForm />
      </div>
    </div>
  );
}