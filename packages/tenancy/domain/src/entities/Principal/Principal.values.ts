/**
 * Tenancy principal value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $TenancyDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $TenancyDomainId.create("entities/Principal/Principal.values");

/**
 * Principal kind vocabulary represented in proof seeds.
 *
 * @example
 * ```ts
 * import { PrincipalKind } from "@beep/tenancy-domain"
 *
 * console.log(PrincipalKind.is.agent("agent"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const PrincipalKind = LiteralKit(["agent", "user"] as const).annotate(
  $I.annote("PrincipalKind", {
    description: "Runtime principal kind represented in the proof seeds.",
  })
);

/**
 * Runtime type for {@link PrincipalKind}.
 *
 * @example
 * ```ts
 * import type { PrincipalKind } from "@beep/tenancy-domain"
 *
 * const value: PrincipalKind = "agent"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type PrincipalKind = typeof PrincipalKind.Type;
