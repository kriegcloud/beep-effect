/**
 * Shared domain model factory defaults.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Model, NonNegativeInt } from "@beep/schema";
import * as S from "effect/Schema";

/**
 * Standard audit and bookkeeping fields for shared domain models.
 *
 * @example
 * ```ts
 * import { defaultFields } from "@beep/shared-domain/factories/DomainModel"
 *
 * const fields = defaultFields
 *
 * void fields
 * ```
 *
 * @since 0.0.0
 * @category domain model
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
 * Domain model class factory with shared default fields.
 *
 * @example
 * ```ts
 * import { make } from "@beep/shared-domain/factories/DomainModel"
 *
 * const makeDomainModel = make
 *
 * void makeDomainModel
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export const make = Model.ClassFactory(defaultFields);
