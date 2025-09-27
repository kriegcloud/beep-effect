import { serverEnv } from "@beep/core-env/server";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `FAQs - ${serverEnv.app.name}`,
};

const FaqsPage = () => {
  return <>FAQs</>;
};

export default FaqsPage;
