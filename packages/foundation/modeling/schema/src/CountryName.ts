/**
 * Country display-name schema backed by generated CLDR territory names.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { TerritoryName as TerritoryNameSchema } from "./TerritoryCode.ts";

/**
 * Country display-name schema backed by generated CLDR territory names.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { CountryName } from "@beep/schema/CountryName"
 *
 * const name = S.decodeUnknownSync(CountryName)("United States")
 * console.log(name) // "United States"
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const CountryName = TerritoryNameSchema;

/**
 * {@inheritDoc CountryName}
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { CountryName } from "@beep/schema/CountryName"
 *
 * const name: CountryName = S.decodeUnknownSync(CountryName)("United States")
 * console.log(name) // "United States"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type CountryName = typeof CountryName.Type;
