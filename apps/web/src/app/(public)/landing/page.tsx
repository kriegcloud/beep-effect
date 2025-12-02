import { serverEnv } from "@beep/core-env/server";

import type { Metadata } from "next";

export const generateMetadata = (): Metadata => ({
  title: `Beep Effect - ${serverEnv.app.name}`,
});

const LandingPage = () => {
  return <>Beep Effect</>;
};

export default LandingPage;
