"use client";

import { clientEnv } from "@beep/core-env/client";
import * as Redacted from "effect/Redacted";
import type React from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

type RecaptchaProviderProps = React.PropsWithChildren;

const RecaptchaProvider: React.FC<RecaptchaProviderProps> = ({ children }) => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={Redacted.value(clientEnv.captchaSiteKey)}>
      {children}
    </GoogleReCaptchaProvider>
  );
};

export default RecaptchaProvider;
