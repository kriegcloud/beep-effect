"use client";
import { clientEnv } from "@beep/shared-infra/ClientEnv";
import { useIsHydrated } from "@beep/ui/hooks";
import { useTranslate } from "@beep/ui/i18n/use-locales";
import { useTheme } from "@mui/material/styles";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "@wojtekmaj/react-recaptcha-v3";
import * as Redacted from "effect/Redacted";
import { type ReactNode, useEffect } from "react";

export function RecaptchaV3({ children }: { readonly children: ReactNode }) {
  const isHydrated = useIsHydrated();

  return (
    <GoogleReCaptchaProvider reCaptchaKey={Redacted.value(clientEnv.captchaSiteKey)} useEnterprise={false}>
      {isHydrated && (
        <style>{`
                    .grecaptcha-badge {
                        visibility: hidden;
                        border-radius: var(--radius) !important;
                        --tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, #0000000d);
                        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow) !important;
                        border-style: var(--tw-border-style) !important;
                        border-width: 1px;
                    }

                    .dark .grecaptcha-badge {
                        border-color: var(--input) !important;
                    }
                `}</style>
      )}

      <RecaptchaV3Style />

      {children}
    </GoogleReCaptchaProvider>
  );
}

function RecaptchaV3Style() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const theme = useTheme();
  const { currentLang } = useTranslate();

  useEffect(() => {
    if (!executeRecaptcha) return;

    const updateRecaptcha = async () => {
      // find iframe with title "reCAPTCHA"
      const iframe = document.querySelector("iframe[title='reCAPTCHA']") as HTMLIFrameElement;
      if (iframe) {
        const iframeSrcUrl = new URL(iframe.src);
        iframeSrcUrl.searchParams.set("theme", theme.palette.mode);
        if (currentLang) iframeSrcUrl.searchParams.set("hl", currentLang.value);
        iframe.src = iframeSrcUrl.toString();
      }
    };

    void updateRecaptcha();
  }, [executeRecaptcha, theme, currentLang]);

  return null;
}
