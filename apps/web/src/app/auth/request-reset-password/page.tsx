import { RequestResetPasswordView } from "@beep/iam-ui";
import { serverEnv } from "@beep/shared-server/ServerEnv";
import type { Metadata } from "next";

export const generateMetadata = (): Metadata => ({
  title: `Request Reset password - ${serverEnv.app.name}`,
});
const Page = () => {
  return <RequestResetPasswordView />;
};

export default Page;
