import { serverEnv } from "@beep/core-env/server";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Privacy Policy - ${serverEnv.app.name}`,
};

const PrivacyPolicyPage = () => {
  return <>Privacy Policy</>;
};

export default PrivacyPolicyPage;
