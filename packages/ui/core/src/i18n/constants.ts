import { BS } from "@beep/schema";
import type { Components, Theme } from "@mui/material/styles";
import {
  arSD as arSDDataGrid,
  enUS as enUSDataGrid,
  frFR as frFRDataGrid,
  zhCN as zhCNDataGrid,
} from "@mui/x-data-grid/locales";
import { enUS as enUSDate, frFR as frFRDate, zhCN as zhCNDate } from "@mui/x-date-pickers/locales";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import { CountryCodeValue } from "./CountryCodeValue";
import { CurrencyCodeValue } from "./CurrencyCodeValue";
import { SupportedLangValue } from "./SupportedLangValue";

export const AdapterLocaleKit = BS.stringLiteralKit(
  "default",
  "pt-BR",
  "pt-PT",
  "es-ES",
  "fr-FR",
  "pl-PL",
  "id-ID",
  "ja-JP",
  "ar-SA",
  "el-GR",
  "sv-SE",
  "it-IT",
  "de-DE",
  "de-DE-informal",
  "de-DE-formal",
  "zh-Hant",
  "zh-Hans",
  "ko-KR",
  "hi-HI",
  "tr-TR",
  "nl-NL",
  "nl-NL-informal",
  "nl-NL-formal",
  "fa-IR",
  "ru-RU",
  "mr-MR"
);

export class AdapterLocale extends AdapterLocaleKit.Schema {
  static readonly Options = AdapterLocaleKit.Options;
  static readonly Enum = AdapterLocaleKit.Enum;
}

export class LangValueToAdapterLocale extends S.transformLiterals(
  ["en", "default"],
  ["fr", "fr-FR"],
  ["cn", "zh-Hant"],
  ["ar", "ar-SA"]
) {}

export const fallbackLang = SupportedLangValue.Enum.en;

export const defaultNS = "common";

export const storageConfig = {
  cookie: { key: "i18next", autoDetection: false },
  localStorage: { key: "i18next", autoDetection: false },
} as const;

/**
 * @countryCode https://flagcdn.com/en/codes.json
 * @adapterLocale https://github.com/iamkun/dayjs/tree/master/src/locale
 * @numberFormat https://simplelocalize.io/data/locales/
 */
export type LangOption = {
  readonly value: SupportedLangValue.Type;
  readonly label: string;
  readonly countryCode: CountryCodeValue.Type;
  readonly adapterLocale?: string | undefined;
  readonly numberFormat: { readonly code: string; readonly currency: CurrencyCodeValue.Type };
  readonly systemValue: { readonly components: Components<Theme> };
};

export const allLanguages = A.make(
  {
    value: SupportedLangValue.Enum.en,
    label: "English",
    countryCode: CountryCodeValue.Enum.US,
    adapterLocale: "en",
    numberFormat: { code: "en-US", currency: CurrencyCodeValue.Enum.USD },
    systemValue: {
      components: { ...enUSDate.components, ...enUSDataGrid.components } as typeof enUSDataGrid.components &
        typeof enUSDataGrid.components,
    },
  },
  {
    value: SupportedLangValue.Enum.fr,
    label: "French",
    countryCode: CountryCodeValue.Enum.FR,
    adapterLocale: "fr",
    numberFormat: { code: "fr-FR", currency: CurrencyCodeValue.Enum.EUR },
    systemValue: {
      components: { ...frFRDate.components, ...frFRDataGrid.components } as typeof frFRDate.components &
        typeof frFRDataGrid.components,
    },
  },
  {
    value: SupportedLangValue.Enum.cn,
    label: "Chinese",
    countryCode: CountryCodeValue.Enum.CN,
    adapterLocale: "zh",
    numberFormat: { code: "zh-CN", currency: CurrencyCodeValue.Enum.CNY },
    systemValue: {
      components: { ...zhCNDate.components, ...zhCNDataGrid.components } as typeof zhCNDate.components &
        typeof zhCNDataGrid.components,
    },
  },
  {
    value: SupportedLangValue.Enum.ar,
    label: "Arabic",
    countryCode: CountryCodeValue.Enum.SD,
    adapterLocale: "ar",
    numberFormat: { code: "ar-SD", currency: CurrencyCodeValue.Enum.SAR },
    systemValue: {
      components: arSDDataGrid.components,
    },
  }
);

export const allLangs = allLanguages;
export type LangCode = LangOption["value"];
export { SupportedLangValue };
