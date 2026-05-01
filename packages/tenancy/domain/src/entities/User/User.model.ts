/**
 * Tenancy user entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $TenancyDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Tenancy from "@beep/shared-domain/identity/Tenancy";
import { UserProfilePack } from "./User.values.js";

const $I = $TenancyDomainId.create("entities/User/User.model");

/**
 * Human account inside an organization.
 *
 * @example
 * ```ts
 * import { User } from "@beep/tenancy-domain"
 *
 * console.log(User.definition.entityId.resource)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class User extends BaseEntity.extend<User>($I`User`)(
  Tenancy.UserId,
  UserProfilePack,
  {},
  $I.annote("User", {
    description: "Human account inside a tenant organization.",
  })
) {}
