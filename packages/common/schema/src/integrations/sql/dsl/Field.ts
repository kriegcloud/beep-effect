import * as VariantSchema from "@beep/schema/core/VariantSchema";
import * as ExperimentalVariantSchema from "@effect/experimental/VariantSchema";
import type * as S from "effect/Schema";
import type {
  ColumnDef,
  ColumnType,
  DSLField,
  DSLVariantField,
  ExactColumnDef,
  ExtractVariantSelectEncoded,
  FieldConfig,
  SchemaColumnError,
  ValidateSchemaColumn,
} from "./types";
import { ColumnMetaSymbol, VariantFieldSymbol } from "./types";

/**
 * Check if the input is a VariantSchema.Field from either our local implementation
 * or from @effect/experimental/VariantSchema (used by @effect/sql/Model).
 * @internal
 */
const isAnyVariantField = (input: unknown): input is VariantSchema.Field<VariantSchema.Field.Config> =>
  VariantSchema.isField(input) || ExperimentalVariantSchema.isField(input);

// Re-export DSLField for backwards compatibility
export type { DSLField, DSLVariantField, SchemaColumnError };

/**
 * Helper type to extract column type from config, defaulting to "string".
 * @internal
 */
type ExtractColumnType<C extends Partial<ColumnDef>> = C extends { type: infer T extends ColumnType } ? T : "string";

/**
 * Creates a DSLField from a plain Effect Schema.
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
): ValidateSchemaColumn<I, ExtractColumnType<C>, DSLField<A, I, R, ExactColumnDef<C>>>;

/**
 * Creates a DSLVariantField from a local VariantSchema.Field.
 * Attaches column metadata while preserving variant configuration.
 *
 * **Type Safety**: This overload validates that the variant field's "select" schema encoded type
 * is compatible with the specified column type. The "select" variant is used because it represents
 * the database row type.
 *
 * @since 1.0.0
 * @category constructors
 */
export function Field<VC extends VariantSchema.Field.Config, const C extends Partial<ColumnDef> = {}>(
  variantField: VariantSchema.Field<VC>,
  config?: FieldConfig<C>
): ValidateSchemaColumn<ExtractVariantSelectEncoded<VC>, ExtractColumnType<C>, DSLVariantField<VC, ExactColumnDef<C>>>;

/**
 * Creates a DSLVariantField from an @effect/experimental/VariantSchema.Field.
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
export function Field<VC extends ExperimentalVariantSchema.Field.Config, const C extends Partial<ColumnDef> = {}>(
  variantField: ExperimentalVariantSchema.Field<VC>,
  config?: FieldConfig<C>
): ValidateSchemaColumn<ExtractVariantSelectEncoded<VC>, ExtractColumnType<C>, DSLVariantField<VC, ExactColumnDef<C>>>;

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
    | VariantSchema.Field<VariantSchema.Field.Config>
    | ExperimentalVariantSchema.Field<ExperimentalVariantSchema.Field.Config>,
  config?: FieldConfig<C>
):
  | DSLField<A, I, R, ExactColumnDef<C>>
  | DSLVariantField<VariantSchema.Field.Config, ExactColumnDef<C>>
  | SchemaColumnError<unknown, ColumnType> {
  const columnDef = {
    type: config?.column?.type ?? "string",
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

    return result as DSLVariantField<VariantSchema.Field.Config, ExactColumnDef<C>>;
  }

  // Case 2: Plain Schema
  const schema = input as S.Schema<A, I, R>;

  // Attach column metadata via annotation
  const annotated = schema.annotations({
    [ColumnMetaSymbol]: columnDef,
  });

  // Also attach as a direct property for easy access without AST traversal
  return Object.assign(annotated, {
    [ColumnMetaSymbol]: columnDef,
  }) as DSLField<A, I, R, ExactColumnDef<C>>;
}
