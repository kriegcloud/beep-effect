import { serverEnv } from "@beep/shared-server/ServerEnv";

import type { Metadata } from "next";

export const generateMetadata = (): Metadata => ({
  title: `Beep Effect - ${serverEnv.app.name}`,
});

const LandingPage = () => {
  return <>Beep Effect</>;
};

export default LandingPage;
