import { serverEnv } from "@beep/core-env/server";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Portfolio - ${serverEnv.app.name}`,
};

const PortfolioPage = () => {
  return <>Portfolio</>;
};

export default PortfolioPage;
