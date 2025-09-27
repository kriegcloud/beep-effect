import { serverEnv } from "@beep/core-env/server";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Contact Us - ${serverEnv.app.name}`,
};

const ContactUsPage = () => {
  return <>Contact Us</>;
};

export default ContactUsPage;
