import { serverEnv } from "@beep/core-env/server";
import { VerifyEmailView } from "@beep/iam-ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Verify email - ${serverEnv.app.name}`,
};

export default function VerifyEmailPage() {
  return <VerifyEmailView />;
}
