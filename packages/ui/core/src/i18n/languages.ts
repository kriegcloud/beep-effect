import { BS } from "@beep/schema";
import type * as S from "effect/Schema";


export class SupportedLocale extends BS.StringLiteralKit("en-US", "fr-FR", "bn-BD", "zh-CN", "hi-IN", "ar-SA").annotations({
  schemaId: Symbol.for("@beep/ui-core/settings/SupportedLocale"),
  identifier: "SupportedLocale",
  title: "Supported Locale",
  description: "The users supported locale.",
}) {

}

export declare namespace SupportedLocale {
  export type Type = S.Schema.Type<typeof SupportedLocale>;
  export type Encoded = S.Schema.Encoded<typeof SupportedLocale>;
}

export interface SupportedLanguage {
  readonly label: string;
  readonly shortLabel: string;
  readonly icon: string;
  readonly locale: SupportedLocale.Type;
  readonly currency: string;
  readonly currencySymbol: string;
}
export const languages: SupportedLanguage[] = [
  {
    label: "English",
    shortLabel: "eng",
    icon: "twemoji:flag-united-kingdom",
    locale: "en-US",
    currency: "USD",
    currencySymbol: "$",
  },
  {
    label: "Française",
    shortLabel: "fra",
    icon: "twemoji:flag-france",
    locale: "fr-FR",
    currency: "EUR",
    currencySymbol: "€",
  },
  {
    label: "বাংলা",
    shortLabel: "ben",
    icon: "twemoji:flag-bangladesh",
    locale: "bn-BD",
    currency: "BDT",
    currencySymbol: "৳",
  },
  {
    label: "官话",
    shortLabel: "zho",
    icon: "twemoji:flag-china",
    locale: "zh-CN",
    currency: "CNY",
    currencySymbol: "¥",
  },
  {
    label: "हिन्दी",
    shortLabel: "hin",
    icon: "twemoji:flag-india",
    locale: "hi-IN",
    currency: "INR",
    currencySymbol: "₹",
  },
  {
    label: "Arabic",
    shortLabel: "ara",
    icon: "twemoji:flag-saudi-arabia",
    locale: "ar-SA",
    currency: "SAR",
    currencySymbol: "﷼",
  },
];
