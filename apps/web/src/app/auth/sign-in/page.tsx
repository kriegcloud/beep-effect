import { SignInView } from "@beep/iam-ui";
import { serverEnv } from "@beep/shared-infra/ServerEnv";

import type { Metadata } from "next";

export const generateMetadata = (): Metadata => ({ title: `Sign in - ${serverEnv.app.name}` });

export default function SignInPage() {
  return <SignInView />;
}
