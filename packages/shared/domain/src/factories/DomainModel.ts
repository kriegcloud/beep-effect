import { Model, NonNegativeInt } from "@beep/schema";
import * as S from "effect/Schema";

/**
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
 */
export const make = Model.ClassFactory(defaultFields);
