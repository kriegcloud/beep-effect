import { serverEnv } from "@beep/core-env/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: `Sign in - ${serverEnv.app.name}` };

export default function SignInPage() {
  return <>Sign In</>;
}
