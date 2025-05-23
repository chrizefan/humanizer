import { Metadata } from "next";
import AuthForm from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Authentication - AI Humanizer",
  description: "Sign in or create an account to use AI Humanizer.",
};

export default function AuthPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <AuthForm />
    </div>
  );
}