import { ResetPasswordView } from "@beep/iam-ui";
import { serverEnv } from "@beep/shared-env/ServerEnv";
import type { Metadata } from "next";

export const generateMetadata = (): Metadata => ({
  title: `Reset password - ${serverEnv.app.name}`,
});

export default function ResetPasswordPage() {
  return <ResetPasswordView />;
}
