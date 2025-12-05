import { SignUpView } from "@beep/iam-ui";
import { serverEnv } from "@beep/shared-infra/ServerEnv";
import type { Metadata } from "next";

export const generateMetadata = (): Metadata => ({ title: `Sign up - ${serverEnv.app.name}` });

export default function SignUpPage() {
  return <SignUpView />;
}
