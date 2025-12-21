import { serverEnv } from "@beep/shared-env/ServerEnv";

import type { Metadata } from "next";

export const generateMetadata = (): Metadata => ({
  title: `FAQs - ${serverEnv.app.name}`,
});

const FaqsPage = () => {
  return <>FAQs</>;
};

export default FaqsPage;
