import { BS } from "@beep/schema";
import type { EntityId } from "@beep/schema/identity";
import type * as VariantSchema from "@effect/experimental/VariantSchema";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import type * as Types from "effect/Types";

type AuditDateField = M.Generated<BS.DateTimeUtcFromAllAcceptable.SchemaType>;
type DefaultFields<TableName extends string, Brand extends string> = {
  readonly id: EntityId.EntityId.ModelIdSchema<TableName>;
  readonly _rowId: EntityId.EntityId.ModelRowIdSchema<Brand>;
  readonly version: M.Generated<S.refine<number, S.refine<number, typeof S.NonNegative>>>;
  readonly source: BS.FieldOptionOmittable<S.SchemaClass<string, string>>;
  readonly createdAt: AuditDateField;
  readonly updatedAt: AuditDateField;
  readonly deletedAt: BS.FieldOptionOmittable<BS.DateTimeUtcFromAllAcceptable.SchemaType>;
  readonly createdBy: BS.FieldOptionOmittable<S.SchemaClass<string, string>>;
  readonly updatedBy: BS.FieldOptionOmittable<S.SchemaClass<string, string>>;
  readonly deletedBy: BS.FieldOptionOmittable<S.SchemaClass<string, string>>;
};
type DefaultFieldKeys = keyof DefaultFields<string, string>;
type NoConflictingKeys<Fields> = Fields & { readonly [K in DefaultFieldKeys]?: never };
type MakeFieldsReturn<
  TableName extends string,
  Brand extends string,
  Fields extends VariantSchema.Field.Fields,
> = Types.MergeLeft<DefaultFields<TableName, Brand>, Fields>;

export const makeFields = <
  const TableName extends string,
  const Brand extends string,
  const Fields extends VariantSchema.Field.Fields,
>(
  entityId: EntityId.EntityId<TableName, Brand>,
  fields: NoConflictingKeys<Fields>
): MakeFieldsReturn<TableName, Brand, Fields> => ({
  id: entityId.modelIdSchema,
  _rowId: entityId.modelRowIdSchema,
  version: M.Generated(
    S.NonNegativeInt.pipe(S.greaterThanOrEqualTo(1)).annotations({
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
  ...fields,
});
