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
export const auditColumns = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityId.SchemaInstance<TableName, Brand>
) =>
  ({
    createdAt: M.Generated(
      BS.DateTimeUtcFromAllAcceptable.annotations({ description: `When the ${entityId.tableName} was created.` })
    ),
    updatedAt: M.Generated(
      BS.DateTimeUtcFromAllAcceptable.annotations({ description: `When the ${entityId.tableName} was last updated.` })
    ),
    deletedAt: BS.FieldOptionOmittable(
      BS.DateTimeUtcFromAllAcceptable.annotations({ description: `When the ${entityId.tableName} was soft deleted.` })
    ),
  }) as const;
export type AuditColumns = typeof auditColumns;

export const userTrackingColumns = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityId.SchemaInstance<TableName, Brand>
) =>
  ({
    createdBy: BS.FieldOptionOmittable(
      S.String.annotations({
        description: `The Actor which created the ${entityId.tableName}.`,
      })
    ),
    updatedBy: BS.FieldOptionOmittable(
      S.String.annotations({
        description: `The Actor who last updated the ${entityId.tableName}`,
      })
    ),
    deletedBy: BS.FieldOptionOmittable(
      S.String.annotations({
        description: `The Actor who soft deleted the ${entityId.tableName}`,
      })
    ),
  }) as const;
export type UserTrackingColumns = typeof userTrackingColumns;

export type Fields = Field.Fields;

export const globalColumns = <const TableName extends string, const Brand extends string>(
  entityId: EntityId.EntityId.SchemaInstance<TableName, Brand>
) =>
  ({
    ...userTrackingColumns(entityId),
    ...auditColumns(entityId),
    // Optimistic locking
    version: M.Generated(
      S.Int.pipe(S.greaterThanOrEqualTo(1)).annotations({
        description: `The version of the ${entityId.tableName}`,
      })
    ),
    // Optional: Enhanced traceability
    source: BS.FieldOptionOmittable(
      S.String.annotations({
        description: `The source of the ${entityId.tableName}`,
      })
    ),
  }) as const;
export type GlobalColumns = typeof globalColumns;

export const makeFields = <const TableName extends string, const Brand extends string, const A extends Fields>(
  entityId: EntityId.EntityId.SchemaInstance<TableName, Brand>,
  a: A
) => {
  const idFields = {
    id: S.optionalWith(entityId, { default: () => entityId.create() }).annotations({
      description: `The public unique identifier for the ${entityId.tableName}`,
    }),
    _rowId: M.Generated(
      entityId.modelRowIdSchema.annotations({
        description: `The internal primary key for the ${entityId.tableName}`,
      })
    ),
  } as const;
  const defaultFields = {
    ...idFields,
    ...globalColumns(entityId),
  } as const;
  return {
    ...defaultFields,
    ...a,
  } as const;
};
