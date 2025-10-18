"use client";
import { clientEnv } from "@beep/core-env/client";
import { useTranslate } from "@beep/ui/i18n/use-locales";
import * as Redacted from "effect/Redacted";
import type React from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

type RecaptchaProviderProps = React.PropsWithChildren;

const RecaptchaProvider: React.FC<RecaptchaProviderProps> = ({ children }) => {
  const { currentLang } = useTranslate();

  return (
    <GoogleReCaptchaProvider language={`${currentLang}`} reCaptchaKey={Redacted.value(clientEnv.captchaSiteKey)}>
      {children}
    </GoogleReCaptchaProvider>
  );
};

export default RecaptchaProvider;
