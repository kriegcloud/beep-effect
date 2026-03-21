import { Model, NonNegativeInt } from "@beep/schema";
import * as S from "effect/Schema";

/**
 * @since 0.0.0
 * @category DomainModel
 */
export const defaultFields = {
  createdAt: Model.DateTimeInsert,
  updatedAt: Model.DateTimeUpdate,
  deletedAt: Model.FieldOption(S.DateTimeUtcFromString),
  createdBy: S.String,
  updatedBy: S.String,
  deletedBy: Model.FieldOption(S.String),
  version: Model.Generated(NonNegativeInt),
  source: S.NonEmptyString,
} as const;

/**
 * @since 0.0.0
 * @category DomainModel
 */
export const make = Model.ClassFactory(defaultFields);
