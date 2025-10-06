import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import type { InitOptions } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { allLanguages, defaultNS, fallbackLang, type LangOption, SupportedLangValue } from "./constants";
export const i18nResourceLoader = resourcesToBackend(
  (lang: SupportedLangValue.Type, namespace: string) => import(`./langs/${lang}/${namespace}.json`)
);

export const i18nOptions = (lang?: SupportedLangValue.Type, namespace = defaultNS): InitOptions => ({
  supportedLngs: SupportedLangValue.Options,
  fallbackLng: fallbackLang,
  lng: lang ?? fallbackLang,
  fallbackNS: defaultNS,
  defaultNS,
  ns: namespace,
});

export function getCurrentLang(lang?: SupportedLangValue.Type): NonNullable<LangOption> {
  const fallbackLang = F.pipe(
    allLanguages,
    A.findFirst((l) => l.value === SupportedLangValue.Enum.en),
    O.match({
      onNone: () => allLanguages[0]!,
      onSome: (l) => l,
    })
  );

  if (!lang) {
    return fallbackLang;
  }

  return F.pipe(
    allLanguages,
    A.findFirst((l) => l.value === lang),
    O.match({
      onNone: () => fallbackLang,
      onSome: (l) => l,
    })
  );
}
