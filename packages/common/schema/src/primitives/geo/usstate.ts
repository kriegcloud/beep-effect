/**
 * US state and territory schemas for both two-letter codes and full names.
 *
 * Supplies literal kits plus code↔name conversions so address forms, shipping flows, and analytics layers agree
 * on the exact state identifiers they exchange.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { USStateCode } from "@beep/schema/primitives/geo/usstate";
 *
 * const state = S.decodeSync(USStateCode)("OR");
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */

import * as S from "effect/Schema";
import { StringLiteralKit } from "../../derived/kits/string-literal-kit";
import { Id } from "./_id";

/**
 * Schema validating US state/territory abbreviations.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { USStateCode } from "@beep/schema/primitives/geo/usstate";
 *
 * const code = S.decodeSync(USStateCode)("WA");
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */
export class USStateCode extends StringLiteralKit(
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
  "PR",
  "GU",
  "VI",
  "AS",
  "MP"
).annotations(
  Id.annotations("USStateCode", {
    description: "A valid US state or territory abbreviation.",
  })
) {}

/**
 * Helper namespace exposing types for {@link USStateCode}.
 *
 * @example
 * import type { USStateCode } from "@beep/schema/primitives/geo/usstate";
 *
 * let code: USStateCode.Type;
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */
export declare namespace USStateCode {
  /**
   * Runtime type for {@link USStateCode}.
   *
   * @example
   * import type { USStateCode } from "@beep/schema/primitives/geo/usstate";
   *
   * let code: USStateCode.Type;
   *
   * @category Primitives/Network/Location
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof USStateCode>;
  /**
   * Encoded representation accepted by {@link USStateCode}.
   *
   * @example
   * import type { USStateCode } from "@beep/schema/primitives/geo/usstate";
   *
   * let encoded: USStateCode.Encoded;
   *
   * @category Primitives/Network/Location
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof USStateCode>;
}

/**
 * Schema validating US state/territory names.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { USStateName } from "@beep/schema/primitives/geo/usstate";
 *
 * const name = S.decodeSync(USStateName)("Oregon");
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */
export class USStateName extends StringLiteralKit(
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
  "District of Columbia",
  "Puerto Rico",
  "Guam",
  "Virgin Islands",
  "American Samoa",
  "Northern Mariana Islands"
).annotations(
  Id.annotations("USStateName", {
    description: "A valid US state or territory name.",
  })
) {}

/**
 * Namespace exposing helper types for {@link USStateName}.
 *
 * @example
 * import type { USStateName } from "@beep/schema/primitives/geo/usstate";
 *
 * let name: USStateName.Type;
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */
export declare namespace USStateName {
  /**
   * Runtime type for {@link USStateName}.
   *
   * @example
   * import type { USStateName } from "@beep/schema/primitives/geo/usstate";
   *
   * let name: USStateName.Type;
   *
   * @category Primitives/Network/Location
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof USStateName>;
  /**
   * Encoded representation accepted by {@link USStateName}.
   *
   * @example
   * import type { USStateName } from "@beep/schema/primitives/geo/usstate";
   *
   * let encoded: USStateName.Encoded;
   *
   * @category Primitives/Network/Location
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof USStateName>;
}

/**
 * Schema that maps {@link USStateCode} literals to {@link USStateName} values.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { USStateNameFromCode } from "@beep/schema/primitives/geo/usstate";
 *
 * const name = S.decodeSync(USStateNameFromCode)("OR");
 * // "Oregon"
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */
export class USStateNameFromCode extends S.transformLiterals(
  [USStateCode.Enum.AL, USStateName.Enum.Alabama],
  [USStateCode.Enum.AK, USStateName.Enum.Alaska],
  [USStateCode.Enum.AZ, USStateName.Enum.Arizona],
  [USStateCode.Enum.AR, USStateName.Enum.Arkansas],
  [USStateCode.Enum.CA, USStateName.Enum.California],
  [USStateCode.Enum.CO, USStateName.Enum.Colorado],
  [USStateCode.Enum.CT, USStateName.Enum.Connecticut],
  [USStateCode.Enum.DE, USStateName.Enum.Delaware],
  [USStateCode.Enum.FL, USStateName.Enum.Florida],
  [USStateCode.Enum.GA, USStateName.Enum.Georgia],
  [USStateCode.Enum.HI, USStateName.Enum.Hawaii],
  [USStateCode.Enum.ID, USStateName.Enum.Idaho],
  [USStateCode.Enum.IL, USStateName.Enum.Illinois],
  [USStateCode.Enum.IN, USStateName.Enum.Indiana],
  [USStateCode.Enum.IA, USStateName.Enum.Iowa],
  [USStateCode.Enum.KS, USStateName.Enum.Kansas],
  [USStateCode.Enum.KY, USStateName.Enum.Kentucky],
  [USStateCode.Enum.LA, USStateName.Enum.Louisiana],
  [USStateCode.Enum.ME, USStateName.Enum.Maine],
  [USStateCode.Enum.MD, USStateName.Enum.Maryland],
  [USStateCode.Enum.MA, USStateName.Enum.Massachusetts],
  [USStateCode.Enum.MI, USStateName.Enum.Michigan],
  [USStateCode.Enum.MN, USStateName.Enum.Minnesota],
  [USStateCode.Enum.MS, USStateName.Enum.Mississippi],
  [USStateCode.Enum.MO, USStateName.Enum.Missouri],
  [USStateCode.Enum.MT, USStateName.Enum.Montana],
  [USStateCode.Enum.NE, USStateName.Enum.Nebraska],
  [USStateCode.Enum.NV, USStateName.Enum.Nevada],
  [USStateCode.Enum.NH, USStateName.Enum["New Hampshire"]],
  [USStateCode.Enum.NJ, USStateName.Enum["New Jersey"]],
  [USStateCode.Enum.NM, USStateName.Enum["New Mexico"]],
  [USStateCode.Enum.NY, USStateName.Enum["New York"]],
  [USStateCode.Enum.NC, USStateName.Enum["North Carolina"]],
  [USStateCode.Enum.ND, USStateName.Enum["North Dakota"]],
  [USStateCode.Enum.OH, USStateName.Enum.Ohio],
  [USStateCode.Enum.OK, USStateName.Enum.Oklahoma],
  [USStateCode.Enum.OR, USStateName.Enum.Oregon],
  [USStateCode.Enum.PA, USStateName.Enum.Pennsylvania],
  [USStateCode.Enum.RI, USStateName.Enum["Rhode Island"]],
  [USStateCode.Enum.SC, USStateName.Enum["South Carolina"]],
  [USStateCode.Enum.SD, USStateName.Enum["South Dakota"]],
  [USStateCode.Enum.TN, USStateName.Enum.Tennessee],
  [USStateCode.Enum.TX, USStateName.Enum.Texas],
  [USStateCode.Enum.UT, USStateName.Enum.Utah],
  [USStateCode.Enum.VT, USStateName.Enum.Vermont],
  [USStateCode.Enum.VA, USStateName.Enum.Virginia],
  [USStateCode.Enum.WA, USStateName.Enum.Washington],
  [USStateCode.Enum.WV, USStateName.Enum["West Virginia"]],
  [USStateCode.Enum.WI, USStateName.Enum.Wisconsin],
  [USStateCode.Enum.WY, USStateName.Enum.Wyoming],
  [USStateCode.Enum.DC, USStateName.Enum["District of Columbia"]],
  [USStateCode.Enum.PR, USStateName.Enum["Puerto Rico"]],
  [USStateCode.Enum.GU, USStateName.Enum.Guam],
  [USStateCode.Enum.VI, USStateName.Enum["Virgin Islands"]],
  [USStateCode.Enum.AS, USStateName.Enum["American Samoa"]],
  [USStateCode.Enum.MP, USStateName.Enum["Northern Mariana Islands"]]
).annotations(
  Id.annotations("USStateNameFromCode", {
    description: "Maps US state codes to their canonical names.",
  })
) {}

/**
 * Helper types for {@link USStateNameFromCode}.
 *
 * @example
 * import type { USStateNameFromCode } from "@beep/schema/primitives/geo/usstate";
 *
 * let mapping: USStateNameFromCode.Type;
 *
 * @category Primitives/Network/Location
 * @since 0.1.0
 */
export declare namespace USStateNameFromCode {
  /**
   * Runtime type for {@link USStateNameFromCode}.
   *
   * @example
   * import type { USStateNameFromCode } from "@beep/schema/primitives/geo/usstate";
   *
   * let mapping: USStateNameFromCode.Type;
   *
   * @category Primitives/Network/Location
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof USStateNameFromCode>;
  /**
   * Encoded representation accepted by {@link USStateNameFromCode}.
   *
   * @example
   * import type { USStateNameFromCode } from "@beep/schema/primitives/geo/usstate";
   *
   * let encoded: USStateNameFromCode.Encoded;
   *
   * @category Primitives/Network/Location
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof USStateNameFromCode>;
}
