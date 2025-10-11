import { serverEnv } from "@beep/core-env/server";
import { SignUpView } from "@beep/iam-ui";
import type { Metadata } from "next";

export const metadata: Metadata = { title: `Sign up - ${serverEnv.app.name}` };

export default function SignUpPage() {
  return <SignUpView />;
}
