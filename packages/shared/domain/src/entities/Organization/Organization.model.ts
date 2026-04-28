/**
 * Shared-kernel Organization entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SharedDomainId } from "@beep/identity/packages";
import * as BaseEntity from "../../entity/BaseEntity.js";
import * as Shared from "../../identity/Shared.js";
import { ProfilePack } from "./Organization.values.js";

const $I = $SharedDomainId.create("entities/Organization/Organization.model");

/**
 * Shared-kernel Organization entity schema.
 *
 * @example
 * ```ts
 * import { Organization } from
 * "@beep/shared-domain/entities/index"
 *
 * console.log(Organization.Model.definition.entityId.tableName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Model extends BaseEntity.BaseEntity.extend<Model>($I`Model`)(
  Shared.OrganizationId,
  ProfilePack,
  {},
  $I.annote("Model", {
    description: "Shared-kernel organization entity used as the tenant root concept.",
  })
) {}
