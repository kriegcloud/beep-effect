/**
 * Tenancy membership entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $TenancyDomainId } from "@beep/identity/packages";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Tenancy from "@beep/shared-domain/identity/Tenancy";
import * as S from "effect/Schema";
import { MembershipRole, MembershipStatus } from "./Membership.values.js";

const $I = $TenancyDomainId.create("entities/Membership/Membership.model");

/**
 * Relationship between a user and an organization.
 *
 * @example
 * ```ts
 * import { Membership } from "@beep/tenancy-domain"
 *
 * console.log(Membership.definition.entityId.entityType)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Membership extends BaseEntity.Class<Membership>($I`Membership`)(
  Tenancy.MembershipId,
  {
    fields: {
      fixtureKey: S.String,
      organizationFixtureKey: S.String,
      role: MembershipRole,
      status: MembershipStatus,
      userFixtureKey: S.String,
    },
    persisted: {
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
      }),
      organizationFixtureKey: EntitySchema.persist.text({
        columnName: "organization_fixture_key",
      }),
      role: EntitySchema.persist.literal({
        columnName: "role",
      }),
      status: EntitySchema.persist.literal({
        columnName: "status",
      }),
      userFixtureKey: EntitySchema.persist.text({
        columnName: "user_fixture_key",
      }),
    },
  },
  $I.annote("Membership", {
    description: "Relationship between a tenant user and organization.",
  })
) {}
