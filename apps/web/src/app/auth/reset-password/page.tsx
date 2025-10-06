import { serverEnv } from "@beep/core-env/server";
import { ResetPasswordView } from "@beep/iam-ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Reset password - ${serverEnv.app.name}`,
};

const Page = () => {
  return <ResetPasswordView />;
};

export default Page;
