"use client";

import { AdapterEffectDateTime } from "@beep/ui-core/adapters";
import { LocalizationProvider as Provider } from "@mui/x-date-pickers/LocalizationProvider";

import { useTranslate } from "./use-locales";

type Props = {
  readonly children: React.ReactNode;
};

// Map our locale codes to BCP 47 locale strings for Intl.DateTimeFormat
const localeMap: Record<string, string> = {
  en: "en-US",
  fr: "fr-FR",
  vi: "vi-VN",
  "zh-cn": "zh-CN",
  "ar-sa": "ar-SA",
};

export function LocalizationProvider({ children }: Props) {
  const { currentLang } = useTranslate();

  // AdapterEffectDateTime uses BCP 47 locale strings
  const locale =
    currentLang.adapterLocale && localeMap[currentLang.adapterLocale] ? localeMap[currentLang.adapterLocale] : "en-US";

  return (
    <Provider dateAdapter={AdapterEffectDateTime} adapterLocale={locale}>
      {children}
    </Provider>
  );
}
