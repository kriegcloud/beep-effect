import { serverEnv } from "@beep/core-env/server";

import type { Metadata } from "next";

export const generateMetadata = (): Metadata => ({
  title: `About Us - ${serverEnv.app.name}`,
});

const AboutUsPage = () => {
  return <>About Us</>;
};

export default AboutUsPage;
