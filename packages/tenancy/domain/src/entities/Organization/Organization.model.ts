/**
 * Tenancy organization entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $TenancyDomainId } from "@beep/identity/packages";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Tenancy from "@beep/shared-domain/identity/Tenancy";
import * as S from "effect/Schema";
import { OrganizationKind, OrganizationLicenseTier } from "./Organization.values.js";

const $I = $TenancyDomainId.create("entities/Organization/Organization.model");

/**
 * Tenant organization participating in a professional workspace.
 *
 * @example
 * ```ts
 * import { Organization } from "@beep/tenancy-domain"
 *
 * console.log(Organization.definition.entityId.tableName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Organization extends BaseEntity.Class<Organization>($I`Organization`)(
  Tenancy.OrganizationId,
  {
    fields: {
      fixtureKey: S.String,
      kind: OrganizationKind,
      licenseTier: OrganizationLicenseTier,
      name: S.String,
    },
    persisted: {
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
      }),
      kind: EntitySchema.persist.literal({
        columnName: "kind",
      }),
      licenseTier: EntitySchema.persist.literal({
        columnName: "license_tier",
      }),
      name: EntitySchema.persist.text({
        columnName: "name",
      }),
    },
  },
  $I.annote("Organization", {
    description: "Tenant organization participating in a professional workspace.",
  })
) {}
