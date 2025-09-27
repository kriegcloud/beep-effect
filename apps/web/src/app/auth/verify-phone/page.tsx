import { serverEnv } from "@beep/core-env/server";
import { VerifyPhoneView } from "@beep/iam-ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Verify Phone Number - ${serverEnv.app.name}`,
};

const Page = () => {
  return <VerifyPhoneView />;
};

export default Page;
