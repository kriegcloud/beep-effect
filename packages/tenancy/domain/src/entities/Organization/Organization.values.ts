/**
 * Tenancy organization value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $TenancyDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $TenancyDomainId.create("entities/Organization/Organization.values");

/**
 * Organization kind used by the first runtime proof.
 *
 * @example
 * ```ts
 * import { OrganizationKind } from "@beep/tenancy-domain"
 *
 * console.log(OrganizationKind.is.solo_practice("solo_practice"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OrganizationKind = LiteralKit(["solo_practice", "wealth_firm"] as const).annotate(
  $I.annote("OrganizationKind", {
    description: "Professional organization kind participating in the runtime proof.",
  })
);

/**
 * Runtime type for {@link OrganizationKind}.
 *
 * @example
 * ```ts
 * import type { OrganizationKind } from "@beep/tenancy-domain"
 *
 * const value: OrganizationKind = "solo_practice"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OrganizationKind = typeof OrganizationKind.Type;

/**
 * Commercial tier visible to the runtime proof.
 *
 * @example
 * ```ts
 * import { OrganizationLicenseTier } from "@beep/tenancy-domain"
 *
 * console.log(OrganizationLicenseTier.is.team("team"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OrganizationLicenseTier = LiteralKit(["solo", "team"] as const).annotate(
  $I.annote("OrganizationLicenseTier", {
    description: "Commercial tier for the proof organization.",
  })
);

/**
 * Runtime type for {@link OrganizationLicenseTier}.
 *
 * @example
 * ```ts
 * import type { OrganizationLicenseTier } from "@beep/tenancy-domain"
 *
 * const value: OrganizationLicenseTier = "solo"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OrganizationLicenseTier = typeof OrganizationLicenseTier.Type;
