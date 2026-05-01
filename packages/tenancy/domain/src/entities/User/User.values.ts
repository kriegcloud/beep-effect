/**
 * Tenancy user value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $TenancyDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $TenancyDomainId.create("entities/User/User.values");

/**
 * User role vocabulary represented in proof seeds.
 *
 * @example
 * ```ts
 * import { UserRole } from "@beep/tenancy-domain"
 *
 * console.log(UserRole.is.attorney("attorney"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const UserRole = LiteralKit(["advisor", "attorney"] as const).annotate(
  $I.annote("UserRole", {
    description: "Human role vocabulary represented in the runtime proof seeds.",
  })
);

/**
 * Runtime type for {@link UserRole}.
 *
 * @example
 * ```ts
 * import type { UserRole } from "@beep/tenancy-domain"
 *
 * const value: UserRole = "advisor"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type UserRole = typeof UserRole.Type;
