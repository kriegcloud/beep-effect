/**
 * Tenancy membership value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $TenancyDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $TenancyDomainId.create("entities/Membership/Membership.values");

/**
 * Membership role vocabulary represented in proof seeds.
 *
 * @example
 * ```ts
 * import { MembershipRole } from "@beep/tenancy-domain"
 *
 * console.log(MembershipRole.is.advisor("advisor"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const MembershipRole = LiteralKit(["advisor", "owner_attorney"] as const).annotate(
  $I.annote("MembershipRole", {
    description: "Relationship role between a user and an organization.",
  })
);

/**
 * Runtime type for {@link MembershipRole}.
 *
 * @example
 * ```ts
 * import type { MembershipRole } from "@beep/tenancy-domain"
 *
 * const value: MembershipRole = "advisor"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type MembershipRole = typeof MembershipRole.Type;

/**
 * Membership status vocabulary represented in proof seeds.
 *
 * @example
 * ```ts
 * import { MembershipStatus } from "@beep/tenancy-domain"
 *
 * console.log(MembershipStatus.is.active("active"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const MembershipStatus = LiteralKit(["active"] as const).annotate(
  $I.annote("MembershipStatus", {
    description: "Lifecycle status for a seeded organization membership.",
  })
);

/**
 * Runtime type for {@link MembershipStatus}.
 *
 * @example
 * ```ts
 * import type { MembershipStatus } from "@beep/tenancy-domain"
 *
 * const value: MembershipStatus = "active"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type MembershipStatus = typeof MembershipStatus.Type;
