/**
 * ISO currency schemas powering dropdowns and validation.
 *
 * Bundles literal kits plus the runtime schema consumed by adapters.
 *
 * @example
 * import { CurrencyCode } from "@beep/schema/primitives/string/currency-code";
 *
 * const usd = CurrencyCode.Enum.US;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
import { StringLiteralKit } from "@beep/schema/derived/kits/string-literal-kit";
import type * as S from "effect/Schema";
import { Id } from "./_id";

/**
 * Schema validating ISO currency codes.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { CurrencyCode } from "@beep/schema/primitives/string/currency-code";
 *
 * const parsed = S.decodeSync(CurrencyCode)("USD");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class CurrencyCode extends StringLiteralKit(
  "AC",
  "AD",
  "AE",
  "AF",
  "AG",
  "AI",
  "AL",
  "AM",
  "AO",
  "AR",
  "AS",
  "AT",
  "AU",
  "AW",
  "AX",
  "AZ",
  "BA",
  "BB",
  "BD",
  "BE",
  "BF",
  "BG",
  "BH",
  "BI",
  "BJ",
  "BL",
  "BM",
  "BN",
  "BO",
  "BQ",
  "BR",
  "BS",
  "BT",
  "BW",
  "BY",
  "BZ",
  "CA",
  "CC",
  "CD",
  "CF",
  "CG",
  "CH",
  "CI",
  "CK",
  "CL",
  "CM",
  "CN",
  "CO",
  "CR",
  "CU",
  "CV",
  "CW",
  "CX",
  "CY",
  "CZ",
  "DE",
  "DJ",
  "DK",
  "DM",
  "DO",
  "DZ",
  "EC",
  "EE",
  "EG",
  "EH",
  "ER",
  "ES",
  "ET",
  "FI",
  "FJ",
  "FK",
  "FM",
  "FO",
  "FR",
  "GA",
  "GB",
  "GD",
  "GE",
  "GF",
  "GG",
  "GH",
  "GI",
  "GL",
  "GM",
  "GN",
  "GP",
  "GQ",
  "GR",
  "GT",
  "GU",
  "GW",
  "GY",
  "HK",
  "HN",
  "HR",
  "HT",
  "HU",
  "ID",
  "IE",
  "IL",
  "IM",
  "IN",
  "IO",
  "IQ",
  "IR",
  "IS",
  "IT",
  "JE",
  "JM",
  "JO",
  "JP",
  "KE",
  "KG",
  "KH",
  "KI",
  "KM",
  "KN",
  "KP",
  "KR",
  "KW",
  "KY",
  "KZ",
  "LA",
  "LB",
  "LC",
  "LI",
  "LK",
  "LR",
  "LS",
  "LT",
  "LU",
  "LV",
  "LY",
  "MA",
  "MC",
  "MD",
  "ME",
  "MF",
  "MG",
  "MH",
  "MK",
  "ML",
  "MM",
  "MN",
  "MO",
  "MP",
  "MQ",
  "MR",
  "MS",
  "MT",
  "MU",
  "MV",
  "MW",
  "MX",
  "MY",
  "MZ",
  "NA",
  "NC",
  "NE",
  "NF",
  "NG",
  "NI",
  "NL",
  "NO",
  "NP",
  "NR",
  "NU",
  "NZ",
  "OM",
  "PA",
  "PE",
  "PF",
  "PG",
  "PH",
  "PK",
  "PL",
  "PM",
  "PR",
  "PS",
  "PT",
  "PW",
  "PY",
  "QA",
  "RE",
  "RO",
  "RS",
  "RU",
  "RW",
  "SA",
  "SB",
  "SC",
  "SD",
  "SE",
  "SG",
  "SH",
  "SI",
  "SJ",
  "SK",
  "SL",
  "SM",
  "SN",
  "SO",
  "SR",
  "SS",
  "ST",
  "SV",
  "SX",
  "SY",
  "SZ",
  "TA",
  "TC",
  "TD",
  "TG",
  "TH",
  "TJ",
  "TK",
  "TL",
  "TM",
  "TN",
  "TO",
  "TR",
  "TT",
  "TV",
  "TW",
  "TZ",
  "UA",
  "UG",
  "US",
  "UY",
  "UZ",
  "VA",
  "VC",
  "VE",
  "VG",
  "VI",
  "VN",
  "VU",
  "WF",
  "WS",
  "XK",
  "YE",
  "YT",
  "ZA",
  "ZM",
  "ZW"
).annotations(
  Id.annotations("CurrencyCode", {
    description: "Represents an ISO 4217 currency code.",
  })
) {
}

/**
 * Namespace exposing helper types for {@link CurrencyCode}.
 *
 * @example
 * import type { CurrencyCode } from "@beep/schema/primitives/string/currency-code";
 *
 * let value: CurrencyCode.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace CurrencyCode {
  /**
   * Runtime type for {@link CurrencyCode}.
   *
   * @example
   * import type { CurrencyCode } from "@beep/schema/primitives/string/currency-code";
   *
   * let value: CurrencyCode.Type;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof CurrencyCode>;
  /**
   * Encoded representation for {@link CurrencyCode}.
   *
   * @example
   * import type { CurrencyCode } from "@beep/schema/primitives/string/currency-code";
   *
   * let encoded: CurrencyCode.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof CurrencyCode>;
}
