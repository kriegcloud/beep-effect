"use client";
import type { SupportedLangValue } from "@beep/ui-core/i18n/constants";
import { i18nOptions, i18nResourceLoader } from "@beep/ui-core/i18n/locales-config";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import type React from "react";
import { useEffect } from "react";
import { initReactI18next, I18nextProvider as Provider } from "react-i18next";

void i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(i18nResourceLoader)
  .init({ ...i18nOptions(), detection: { caches: ["cookie"] } });

type I18nProviderProps = {
  readonly lang?: SupportedLangValue.Type | undefined;
  readonly children: React.ReactNode;
};

export function I18nProvider({ lang, children }: I18nProviderProps) {
  /**
   * Cookie storage
   * Restore the selected language after a page refresh.
   * since i18next might lose the language state on reload.
   */
  useEffect(() => {
    if (!lang) {
      return;
    }

    void i18next.changeLanguage(lang);
  }, [lang]);

  return <Provider i18n={i18next}>{children}</Provider>;
}
