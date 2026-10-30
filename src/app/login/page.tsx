import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in | Schwab Retail Demo",
};

export const instant = false

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="login-page">
      <LoginForm />
    </div>
  );
}
