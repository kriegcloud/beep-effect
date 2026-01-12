import { RequestResetPasswordView } from "@beep/iam-ui";
import { serverEnv } from "@beep/shared-env/ServerEnv";
import type { Metadata } from "next";

export const generateMetadata = (): Metadata => ({
  title: `Request password reset - ${serverEnv.app.name}`,
});

export default function RequestResetPasswordPage() {
  return <RequestResetPasswordView />;
}
