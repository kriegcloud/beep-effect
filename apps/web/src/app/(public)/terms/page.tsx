import { serverEnv } from "@beep/core-env/server";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Terms & Conditions - ${serverEnv.app.name}`,
};

const TermsPage = () => {
  return <>Terms & Conditions</>;
};

export default TermsPage;
