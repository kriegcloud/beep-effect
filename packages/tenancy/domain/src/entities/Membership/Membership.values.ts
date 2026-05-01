/**
 * Tenancy membership value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $TenancyDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as S from "effect/Schema";

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

/**
 * Entity-specific fields contributed to the tenancy Membership entity.
 *
 * @example
 * ```ts
 * import { MembershipProfileMixin } from "@beep/tenancy-domain"
 *
 * console.log(MembershipProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const MembershipProfileMixin = EntityMixin.make($I`MembershipProfileMixin`)(
  {
    fixtureKey: S.String,
    organizationFixtureKey: S.String,
    role: MembershipRole,
    status: MembershipStatus,
    userFixtureKey: S.String,
  },
  {
    description: "Runtime proof fields owned by the tenancy Membership entity.",
    fields: {
      fixtureKey: {
        columnName: "fixture_key",
        description: "Stable fixture identifier used by deterministic runtime scenarios.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      organizationFixtureKey: {
        columnName: "organization_fixture_key",
        description: "Fixture key of the organization side of the membership.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      role: {
        columnName: "role",
        description: "Relationship role held by the member.",
        nullable: false,
        storageKind: "literal",
        valueStrategy: "provided",
      },
      status: {
        columnName: "status",
        description: "Membership lifecycle status.",
        nullable: false,
        storageKind: "literal",
        valueStrategy: "provided",
      },
      userFixtureKey: {
        columnName: "user_fixture_key",
        description: "Fixture key of the user side of the membership.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed Membership profile mixin.
 *
 * @example
 * ```ts
 * import { MembershipProfilePack } from "@beep/tenancy-domain"
 *
 * console.log(MembershipProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const MembershipProfilePack = EntityMixin.pack(MembershipProfileMixin);
