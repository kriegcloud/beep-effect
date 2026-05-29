/**
 * Party value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WealthManagementDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $WealthManagementDomainId.create("entities/Party/Party.values");

/**
 * Fixture party type vocabulary.
 *
 * @example
 * ```ts
 * import { PartyType } from "@beep/wealth-management-domain"
 *
 * console.log(PartyType.is.person("person"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const PartyType = LiteralKit(["person"]).annotate(
  $I.annote("PartyType", {
    description: "Closed fixture type vocabulary for parties.",
  })
);

/**
 * Runtime type for {@link PartyType}.
 *
 * @example
 * ```ts
 * import type { PartyType } from "@beep/wealth-management-domain"
 *
 * const value: PartyType = "person"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type PartyType = typeof PartyType.Type;
