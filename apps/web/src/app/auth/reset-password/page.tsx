import { ResetPasswordView } from "@beep/iam-ui";
import { serverEnv } from "@beep/shared-server/ServerEnv";
import type { Metadata } from "next";

export const generateMetadata = (): Metadata => ({
  title: `Reset password - ${serverEnv.app.name}`,
});

const Page = () => {
  return <ResetPasswordView />;
};

export default Page;
