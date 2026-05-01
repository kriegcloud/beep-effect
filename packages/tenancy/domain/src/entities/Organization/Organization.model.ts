/**
 * Tenancy organization entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $TenancyDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Tenancy from "@beep/shared-domain/identity/Tenancy";
import { OrganizationProfilePack } from "./Organization.values.js";

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
export class Organization extends BaseEntity.extend<Organization>($I`Organization`)(
  Tenancy.OrganizationId,
  OrganizationProfilePack,
  {},
  $I.annote("Organization", {
    description: "Tenant organization participating in a professional workspace.",
  })
) {}
