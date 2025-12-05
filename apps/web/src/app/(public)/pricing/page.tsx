import { serverEnv } from "@beep/shared-infra/ServerEnv";

import type { Metadata } from "next";

export const generateMetadata = (): Metadata => ({
  title: `Pricing - ${serverEnv.app.name}`,
});

const PricingPage = () => {
  return <>Pricing</>;
};

export default PricingPage;
