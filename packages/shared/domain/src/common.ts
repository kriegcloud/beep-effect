import { BS } from "@beep/schema";
import type { EntityId } from "@beep/schema/EntityId";
import type { Field } from "@effect/experimental/VariantSchema";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
// import {create} from "mutative";

/**
 * Audit columns optimized for PostgreSQL timestamp with timezone:
 * - createdAt: Auto-set on insert, omitted from updates
 * - updatedAt: Auto-set on both insert and update operations
 * - deletedAt: Optional field for soft delete functionality defaults to null is Option on select variants
 */
export const auditColumns = {
  createdAt: BS.DateTimeInsertFromDateOmittable({
    description: "The date and time the record was created",
  }),
  updatedAt: BS.DateTimeUpdateFromDateOmittable({
    description: "The date and time the record was last updated",
  }),
  deletedAt: BS.FieldOptionOmittable(
    BS.DateTimeFromDate({
      description: "If not null, the date and time the record was deleted",
    })
  ),
} as const;
export type AuditColumns = typeof auditColumns;

export const userTrackingColumns = {
  createdBy: BS.FieldOptionOmittable(S.String),
  updatedBy: BS.FieldOptionOmittable(S.String),
  deletedBy: BS.FieldOptionOmittable(S.String),
} as const;
export type UserTrackingColumns = typeof userTrackingColumns;

export type Fields = Field.Fields;

// function mergeFields<const A extends Fields, const B extends Fields>(a: A, b: B): A & B;
//
// function mergeFields<const A extends Fields>(a: A): <const B extends Fields>(b: B) => A & B;
//
// function mergeFields<const A extends Fields, const B extends Fields>(a: A, b?: B) {
//   if (b === undefined) {
//     return <const C extends Fields>(bb: C): A & C =>
//       create<A & C>(a as A & C, (draft) => {
//         // Right-bias: bb overwrites keys from a on conflicts
//         Object.assign(draft, bb);
//       });
//   }
//
//   return create<A & B>(a as A & B, (draft) => {
//     // Right-bias: b overwrites keys from a on conflicts
//     Object.assign(draft, b as B);
//   });
// }

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
    id: entityId.modelIdSchema,
    _rowId: entityId.modelRowIdSchema,
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
