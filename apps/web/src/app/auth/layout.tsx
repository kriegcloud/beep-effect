import type React from "react";

import RecaptchaProvider from "./recaptcha-provider.client";

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <RecaptchaProvider>{children}</RecaptchaProvider>;
};

export default Layout;
