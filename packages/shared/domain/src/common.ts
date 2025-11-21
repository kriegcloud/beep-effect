import { BS } from "@beep/schema";
import type { EntityId } from "@beep/schema/identity";
import type { Field } from "@effect/experimental/VariantSchema";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * Audit columns optimized for PostgreSQL timestamp with timezone:
 * - createdAt: Auto-set on insert, omitted from updates
 * - updatedAt: Auto-set on both insert and update operations
 * - deletedAt: Optional field for soft delete functionality defaults to null is Option on select variants
 */
export const auditColumns = {
  createdAt: M.Generated(BS.DateTimeUtcFromAllAcceptable),
  updatedAt: M.Generated(BS.DateTimeUtcFromAllAcceptable),
  deletedAt: BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable),
} as const;
export type AuditColumns = typeof auditColumns;

export const userTrackingColumns = {
  createdBy: BS.FieldOmittableWithDefault(S.NullOr(S.String))(() => "app"),
  updatedBy: BS.FieldOmittableWithDefault(S.NullOr(S.String))(() => "app"),
  deletedBy: BS.FieldOptionOmittable(S.String),
} as const;
export type UserTrackingColumns = typeof userTrackingColumns;

export type Fields = Field.Fields;

export const globalColumns = {
  ...userTrackingColumns,
  ...auditColumns,
  // Optimistic locking
  version: M.Generated(S.Int.pipe(S.greaterThanOrEqualTo(1))),
  // Optional: Enhanced traceability
  source: BS.FieldOptionOmittable(S.String),
} as const;
export type GlobalColumns = typeof globalColumns;

export const makeFields = <const TableName extends string, const Brand extends string, const A extends Fields>(
  entityId: EntityId.EntityIdSchemaInstance<TableName, Brand>,
  a: A
) => {
  const idFields = {
    id: S.optionalWith(entityId, { default: () => entityId.create() }),
    _rowId: M.Generated(entityId.modelRowIdSchema),
  } as const;
  const defaultFields = {
    ...idFields,
    ...globalColumns,
  } as const;
  return {
    ...defaultFields,
    ...a,
  } as const;
};
