import { serverEnv } from "@beep/shared-env/ServerEnv";

import type { Metadata } from "next";

export const generateMetadata = (): Metadata => ({
  title: `Terms & Conditions - ${serverEnv.app.name}`,
});

const TermsPage = () => {
  return <>Terms & Conditions</>;
};

export default TermsPage;
