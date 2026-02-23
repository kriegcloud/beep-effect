import { DevForm } from "@beep/notes/components/auth/email-form";
import { LoginForm } from "@beep/notes/components/auth/login-form";
import { isAuth } from "@beep/notes/components/auth/rsc/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  description: "Login to your account",
  title: "Login",
};

export default async function LoginPage() {
  if (await isAuth()) {
    redirect("/");
  }

  return (
    <div className="container mt-[-56px] flex h-screen flex-col items-center pt-[25vh]">
      <div className="flex w-full flex-col gap-6 sm:w-[350px]">
        <LoginForm />

        {process.env.NODE_ENV === "development" && (
          <>
            <span className="text-xs text-gray-500">only for dev</span>
            <DevForm />
          </>
        )}
      </div>
    </div>
  );
}
