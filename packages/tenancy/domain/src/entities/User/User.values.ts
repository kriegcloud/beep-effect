/**
 * Tenancy user value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $TenancyDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as S from "effect/Schema";

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

/**
 * Entity-specific fields contributed to the tenancy User entity.
 *
 * @example
 * ```ts
 * import { UserProfileMixin } from "@beep/tenancy-domain"
 *
 * console.log(UserProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const UserProfileMixin = EntityMixin.make($I`UserProfileMixin`)(
  {
    displayName: S.String,
    fixtureKey: S.String,
    role: UserRole,
  },
  {
    description: "Runtime proof fields owned by the tenancy User entity.",
    fields: {
      displayName: {
        columnName: "display_name",
        description: "Human-readable user name.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      fixtureKey: {
        columnName: "fixture_key",
        description: "Stable fixture identifier used by deterministic runtime scenarios.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      role: {
        columnName: "role",
        description: "Professional role for the seeded user.",
        nullable: false,
        storageKind: "literal",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed User profile mixin.
 *
 * @example
 * ```ts
 * import { UserProfilePack } from "@beep/tenancy-domain"
 *
 * console.log(UserProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const UserProfilePack = EntityMixin.pack(UserProfileMixin);
