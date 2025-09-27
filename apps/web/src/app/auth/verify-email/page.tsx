import { serverEnv } from "@beep/core-env/server";
import { VerifyEmailView } from "@beep/iam-ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Verify email - ${serverEnv.app.name}`,
};

const Page = () => {
  return <VerifyEmailView />;
};

export default Page;
