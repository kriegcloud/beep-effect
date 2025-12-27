import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import {
  type BSLField,
  type BSLVariantField,
  type ColumnDef,
  ColumnMetaSymbol,
  type ColumnType,
  type ExactColumnDef,
  type ExtractVariantSelectEncoded,
  type FieldConfig,
  ModelVariant,
  type SchemaColumnError,
  type ValidateSchemaColumn,
  VariantFieldSymbol,
} from "./types";

/**
 * Check if the input is a VariantSchema.Field from either our local implementation
 * or from @effect/experimental/VariantSchema (used by @effect/sql/Model).
 * @internal
 */
const isAnyVariantField = (input: unknown): input is BS.VariantSchema.Field<BS.VariantSchema.Field.Config> =>
  BS.VariantSchema.isField(input) || BS.VariantSchema.isField(input);

// Re-export BSLField for backwards compatibility
export type { BSLField, BSLVariantField, SchemaColumnError };

/**
 * Helper type to extract column type from config, defaulting to "string".
 * @internal
 */
type ExtractColumnType<C extends Partial<ColumnDef>> = C extends { type: infer T extends ColumnType.Type }
  ? T
  : "string";

/**
 * Creates a BSLField from a plain Effect Schema.
 * Attaches column metadata via ColumnMetaSymbol annotation.
 *
 * **Type Safety**: This overload validates that the schema's encoded type (I) is compatible
 * with the specified column type. Incompatible combinations result in a compile-time error type.
 *
 * @example
 * ```ts
 * // Valid combinations
 * Field(S.String, { column: { type: "string" } })   // string -> text
 * Field(S.String, { column: { type: "uuid" } })     // string -> uuid
 * Field(S.Int, { column: { type: "integer" } })     // number -> integer
 * Field(S.Boolean, { column: { type: "boolean" } }) // boolean -> boolean
 * Field(S.Struct({...}), { column: { type: "json" } }) // object -> jsonb
 *
 * // Invalid combinations (compile error)
 * Field(S.String, { column: { type: "integer" } })  // string incompatible with integer
 * Field(S.Int, { column: { type: "uuid" } })        // number incompatible with uuid
 * ```
 *
 * @since 1.0.0
 * @category constructors
 */
export function Field<A, I, R, const C extends Partial<ColumnDef> = {}>(
  schema: S.Schema<A, I, R>,
  config?: FieldConfig<C>
): ValidateSchemaColumn<I, ExtractColumnType<C>, BSLField<A, I, R, ExactColumnDef<C>>>;

/**
 * Creates a BSLVariantField from a local VariantSchema.Field.
 * Attaches column metadata while preserving variant configuration.
 *
 * **Type Safety**: This overload validates that the variant field's "select" schema encoded type
 * is compatible with the specified column type. The "select" variant is used because it represents
 * the database row type.
 *
 * @since 1.0.0
 * @category constructors
 */
export function Field<VC extends BS.VariantSchema.Field.Config, const C extends Partial<ColumnDef> = {}>(
  variantField: BS.VariantSchema.Field<VC>,
  config?: FieldConfig<C>
): ValidateSchemaColumn<ExtractVariantSelectEncoded<VC>, ExtractColumnType<C>, BSLVariantField<VC, ExactColumnDef<C>>>;

/**
 * Creates a BSLVariantField from an @effect/experimental/VariantSchema.Field.
 * Attaches column metadata while preserving variant configuration.
 * This overload handles M.Generated, M.Sensitive, M.GeneratedByApp, M.FieldOption, etc.
 *
 * **Type Safety**: This overload validates that the variant field's "select" schema encoded type
 * is compatible with the specified column type. The "select" variant is used because it represents
 * the database row type.
 *
 * @since 1.0.0
 * @category constructors
 */
export function Field<VC extends BS.VariantSchema.Field.Config, const C extends Partial<ColumnDef> = {}>(
  variantField: BS.VariantSchema.Field<VC>,
  config?: FieldConfig<C>
): ValidateSchemaColumn<ExtractVariantSelectEncoded<VC>, ExtractColumnType<C>, BSLVariantField<VC, ExactColumnDef<C>>>;

/**
 * Implementation of Field factory.
 * Detects input type and attaches column metadata appropriately.
 *
 * Note: The return type includes SchemaColumnError for type compatibility with overloads.
 * At runtime, SchemaColumnError is never actually returned - it's purely a compile-time
 * mechanism to prevent invalid schema/column type combinations.
 */
export function Field<A, I, R, const C extends Partial<ColumnDef> = {}>(
  input:
    | S.Schema<A, I, R>
    | BS.VariantSchema.Field<BS.VariantSchema.Field.Config>
    | BS.VariantSchema.Field<BS.VariantSchema.Field.Config>,
  config?: FieldConfig<C>
):
  | BSLField<A, I, R, ExactColumnDef<C>>
  | BSLVariantField<BS.VariantSchema.Field.Config, ExactColumnDef<C>>
  | SchemaColumnError<unknown, ColumnType.Type> {
  const columnDef = {
    type: config?.column?.type ?? ModelVariant.Enum.select,
    primaryKey: config?.column?.primaryKey ?? false,
    unique: config?.column?.unique ?? false,
    nullable: config?.column?.nullable ?? false,
    autoIncrement: config?.column?.autoIncrement ?? false,
    defaultValue: config?.column?.defaultValue,
  } as ExactColumnDef<C>;

  // Case 1: VariantSchema.Field input (from local or @effect/experimental)
  if (isAnyVariantField(input)) {
    // Create a new object that extends the variant field with column metadata
    // We need to preserve the prototype chain for Pipeable support
    const variantFieldProto = Object.getPrototypeOf(input);
    const result = Object.create(variantFieldProto);

    // Copy all properties from the original variant field
    Object.assign(result, input);

    // Preserve the schemas property explicitly
    result.schemas = input.schemas;

    // Attach DSL-specific metadata
    result[ColumnMetaSymbol] = columnDef;
    result[VariantFieldSymbol] = true;

    return result as BSLVariantField<BS.VariantSchema.Field.Config, ExactColumnDef<C>>;
  }

  // Case 2: Plain Schema

  // Attach column metadata via annotation
  const annotated = input.annotations({
    [ColumnMetaSymbol]: columnDef,
  });

  // Also attach as a direct property for easy access without AST traversal
  return Object.assign(annotated, {
    [ColumnMetaSymbol]: columnDef,
  }) as BSLField<A, I, R, ExactColumnDef<C>>;
}
