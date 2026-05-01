/**
 * Tenancy membership entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $TenancyDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Tenancy from "@beep/shared-domain/identity/Tenancy";
import { MembershipProfilePack } from "./Membership.values.js";

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
export class Membership extends BaseEntity.extend<Membership>($I`Membership`)(
  Tenancy.MembershipId,
  MembershipProfilePack,
  {},
  $I.annote("Membership", {
    description: "Relationship between a tenant user and organization.",
  })
) {}
