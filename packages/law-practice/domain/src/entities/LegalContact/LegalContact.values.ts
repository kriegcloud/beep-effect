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
 * Legal contact role accepted by the law-practice proof fixtures.
 *
 * @example
 * ```ts
 * import { LegalContactRole } from "@beep/law-practice-domain"
 * import * as S from "effect/Schema"
 *
 * const role = S.decodeUnknownSync(LegalContactRole)("founder")
 * console.log(role) // "founder"
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export const LegalContactRole = LiteralKit(["founder"]).pipe(
  $I.annoteSchema("LegalContactRole", {
    description: "Legal contact role accepted by law-practice proof fixtures.",
  })
);

/**
 * Type-level literal union produced by {@link LegalContactRole}.
 *
 * @example
 * ```ts
 * import type { LegalContactRole } from "@beep/law-practice-domain"
 *
 * const role = "founder" satisfies LegalContactRole
 * console.log(role)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type LegalContactRole = typeof LegalContactRole.Type;
