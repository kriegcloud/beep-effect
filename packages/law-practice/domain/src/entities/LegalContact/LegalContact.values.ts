/**
 * Legal contact value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $LawPracticeDomainId.create("entities/LegalContact/LegalContact.values");

/**
 * Legal contact role vocabulary represented in proof seeds.
 *
 * @example
 * ```ts
 * import { LegalContactRole } from "@beep/law-practice-domain"
 *
 * console.log(LegalContactRole.is.founder("founder"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const LegalContactRole = LiteralKit(["founder"]).pipe(
  $I.annoteSchema("LegalContactRole", {
    description: "Legal contact role vocabulary represented in proof seeds.",
  })
);

/**
 * Runtime type for {@link LegalContactRole}.
 *
 * @example
 * ```ts
 * import type { LegalContactRole } from "@beep/law-practice-domain"
 *
 * const value: LegalContactRole = "founder"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type LegalContactRole = typeof LegalContactRole.Type;
