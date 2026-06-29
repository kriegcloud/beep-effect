/**
 * CLDR territory display-name schema.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { TerritoryName as TerritoryNameSchema } from "./TerritoryCode.ts";

/**
 * CLDR territory display-name schema.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { TerritoryName } from "@beep/schema/TerritoryName"
 *
 * const name = S.decodeUnknownSync(TerritoryName)("United States")
 * console.log(name) // "United States"
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const TerritoryName = TerritoryNameSchema;

/**
 * {@inheritDoc TerritoryName}
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { TerritoryName } from "@beep/schema/TerritoryName"
 *
 * const name: TerritoryName = S.decodeUnknownSync(TerritoryName)("United States")
 * console.log(name) // "United States"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type TerritoryName = typeof TerritoryName.Type;
