import { serverEnv } from "@beep/shared-infra/ServerEnv";

import type { Metadata } from "next";

export const generateMetadata = (): Metadata => ({
  title: `Contact Us - ${serverEnv.app.name}`,
});

const ContactUsPage = () => {
  return <>Contact Us</>;
};

export default ContactUsPage;
