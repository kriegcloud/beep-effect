import { serverEnv } from "@beep/shared-env/ServerEnv";

import type { Metadata } from "next";

export const generateMetadata = (): Metadata => ({
  title: `Privacy Policy - ${serverEnv.app.name}`,
});

const PrivacyPolicyPage = () => {
  return <>Privacy Policy</>;
};

export default PrivacyPolicyPage;
