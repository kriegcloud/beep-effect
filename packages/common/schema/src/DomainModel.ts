/**
 * Shared domain model base with audit and bookkeeping fields.
 *
 * @module
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";
import { NonNegativeInt } from "./Int.ts";
import * as Model from "./Model.ts";

const $I = $SchemaId.create("DomainModel");

/**
 * Default audit and bookkeeping fields for persisted domain models.
 *
 * The base intentionally does not include an `id` field. Derived models add the
 * branded identifier that belongs to their aggregate or entity.
 *
 * @example
 * ```ts
 * import { defaultFields } from "@beep/schema/DomainModel"
 *
 * const fieldNames = Object.keys(defaultFields)
 *
 * void fieldNames
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const defaultFields = {
  createdAt: Model.DateTimeInsertFromNumber,
  updatedAt: Model.DateTimeUpdateFromNumber,
  deletedAt: Model.FieldOption(S.DateTimeUtcFromMillis),
  createdBy: Model.FieldOption(S.String),
  updatedBy: Model.FieldOption(S.String),
  deletedBy: Model.FieldOption(S.String),
  version: Model.Generated(NonNegativeInt),
  source: Model.FieldOption(S.String),
} as const;

/**
 * Base class for persisted domain models that share audit metadata.
 *
 * @example
 * ```ts
 * import { DomainModel } from "@beep/schema/DomainModel"
 * import * as Model from "@beep/schema/Model"
 * import * as S from "effect/Schema"
 *
 * const OrganizationId = S.String.pipe(S.brand("OrganizationId"))
 *
 * class Organization extends DomainModel.extend<Organization, typeof DomainModel>("Organization")({
 *   id: Model.Generated(OrganizationId)
 * }) {}
 *
 * void Organization.insert
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class DomainModel extends Model.Class<DomainModel>($I`DomainModel`)(
  defaultFields,
  $I.annote("DomainModel", {
    description: "Base persisted domain model with shared audit and bookkeeping fields.",
  })
) {}
