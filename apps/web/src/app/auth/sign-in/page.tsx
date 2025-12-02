import { serverEnv } from "@beep/core-env/server";
import { SignInView } from "@beep/iam-ui";

import type { Metadata } from "next";

export const generateMetadata = (): Metadata => ({ title: `Sign in - ${serverEnv.app.name}` });

export default function SignInPage() {
  return <SignInView />;
}
