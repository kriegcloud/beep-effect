import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import type { InitOptions } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import type { LangOption } from "./constants";
import { allLanguages, defaultNS, fallbackLang, SupportedLangValue } from "./constants";

export const i18nResourceLoader = resourcesToBackend(
  (lang: SupportedLangValue.Type, namespace: string) => import(`./langs/${lang}/${namespace}.json`)
);

export const i18nOptions = (lang?: SupportedLangValue.Type | undefined, namespace = defaultNS): InitOptions => ({
  supportedLngs: SupportedLangValue.Options,
  fallbackLng: fallbackLang,
  lng: lang ?? fallbackLang,
  fallbackNS: defaultNS,
  defaultNS,
  ns: namespace,
});

export function getCurrentLang(lang?: SupportedLangValue.Type | undefined): LangOption {
  const fallbackLang = F.pipe(
    allLanguages,
    A.findFirst((l) => l.value === SupportedLangValue.Enum.en),
    O.match({
      onNone: () => allLanguages[0]!,
      onSome: (l) => l,
    })
  );

  if (!lang) {
    return fallbackLang as LangOption;
  }

  return F.pipe(
    allLanguages,
    A.findFirst((l) => l.value === lang),
    O.match({
      onNone: () => ({
        value: fallbackLang.value,
        label: fallbackLang.label,
        countryCode: fallbackLang.countryCode,
        adapterLocale: fallbackLang.adapterLocale ?? undefined,
        numberFormat: {
          code: fallbackLang.numberFormat.code,
          currency: fallbackLang.numberFormat.currency,
        },
        ...(fallbackLang.systemValue ? { systemValue: fallbackLang.systemValue } : {}),
      }),
      onSome: (l) => ({
        value: l.value,
        label: l.label,
        countryCode: l.countryCode,
        adapterLocale: l.adapterLocale ?? undefined,
        numberFormat: {
          code: l.numberFormat.code,
          currency: l.numberFormat.currency,
        },
        ...(l.systemValue ? { systemValue: l.systemValue } : {}),
      }),
    })
  ) as LangOption;
}
