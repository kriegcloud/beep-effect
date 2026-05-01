/**
 * Tenancy principal entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $TenancyDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Tenancy from "@beep/shared-domain/identity/Tenancy";
import { PrincipalProfilePack } from "./Principal.values.js";

const $I = $TenancyDomainId.create("entities/Principal/Principal.model");

/**
 * Actor reference used by the fixture proof before authoritative writes exist.
 *
 * @example
 * ```ts
 * import { Principal } from "@beep/tenancy-domain"
 *
 * console.log(Principal.definition.entityId.tableName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Principal extends BaseEntity.extend<Principal>($I`Principal`)(
  Tenancy.PrincipalId,
  PrincipalProfilePack,
  {},
  $I.annote("Principal", {
    description: "Tenant-scoped actor reference used by the runtime proof.",
  })
) {}
