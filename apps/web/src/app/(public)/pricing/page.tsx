import { serverEnv } from "@beep/core-env/server";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Pricing - ${serverEnv.app.name}`,
};

const PricingPage = () => {
  return <>Pricing</>;
};

export default PricingPage;
