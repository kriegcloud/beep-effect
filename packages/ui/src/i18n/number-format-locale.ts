import i18next from "i18next";
import { SupportedLangValue } from "./constants";
import { getCurrentLang } from "./locales-config";

export function formatNumberLocale() {
  const currentLang = getCurrentLang(
    (i18next.resolvedLanguage ?? SupportedLangValue.Enum.en) as SupportedLangValue.Type
  );

  return {
    code: currentLang?.numberFormat.code,
    currency: currentLang?.numberFormat.currency,
  };
}
