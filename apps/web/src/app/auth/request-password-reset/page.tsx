import { serverEnv } from "@beep/core-env/server";
import { RequestPasswordResetView } from "@beep/iam-ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Request Reset password - ${serverEnv.app.name}`,
};
const Page = () => {
  return <RequestPasswordResetView />;
};

export default Page;
