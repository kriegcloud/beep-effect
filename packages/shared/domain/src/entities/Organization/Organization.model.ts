/**
 * Organization domain model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SharedDomainId } from "@beep/identity";
import { DomainModel } from "@beep/schema/DomainModel";
import * as M from "@beep/schema/Model";
import { Shared } from "../../entity-ids/index.ts";

const $I = $SharedDomainId.create("entities/Organization/Organization.model");

/**
 * Persisted organization model.
 *
 * @example
 * ```ts
 * import { Model } from "@beep/shared-domain/entities/Organization/Organization.model"
 *
 * const schema = Model
 *
 * void schema
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export class Model extends DomainModel.extend<Model, typeof DomainModel>($I`OrganizationModel`)(
  {
    id: M.Generated(Shared.OrganizationId),
  },
  $I.annote("OrganizationModel", {
    description: "The Organization model",
  })
) {}
