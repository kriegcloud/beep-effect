import { BS } from "@beep/schema";
import type { EntityId } from "@beep/schema/identity";
import type { Field } from "@effect/experimental/VariantSchema";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export const makeFields = <const TableName extends string, const Brand extends string, const A extends Field.Fields>(
  entityId: EntityId.EntityId.SchemaInstance<TableName, Brand>,
  a: A
) => {
  return {
    id: S.optionalWith(entityId, { default: () => entityId.create() }).annotations({
      description: `The public unique identifier for the ${entityId.tableName}`,
    }),
    _rowId: M.Generated(
      entityId.modelRowIdSchema.annotations({
        description: `The internal primary key for the ${entityId.tableName}`,
      })
    ),
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
    createdAt: M.Generated(
      BS.DateTimeUtcFromAllAcceptable.annotations({ description: `When the ${entityId.tableName} was created.` })
    ),
    updatedAt: M.Generated(
      BS.DateTimeUtcFromAllAcceptable.annotations({ description: `When the ${entityId.tableName} was last updated.` })
    ),
    deletedAt: BS.FieldOptionOmittable(
      BS.DateTimeUtcFromAllAcceptable.annotations({ description: `When the ${entityId.tableName} was soft deleted.` })
    ),
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
    ...a,
  } as const;
};
