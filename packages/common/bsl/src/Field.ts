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

// ============================================================================
// Configurator Types (returned by first curried call)
// ============================================================================

/**
 * Configurator returned by Field(schema) for plain Schema inputs.
 * Call with config to get the final BSLField.
 * @internal
 */
type SchemaConfigurator<A, I, R> = <const C extends Partial<ColumnDef> = {}>(
  config?: FieldConfig<C>
) => ValidateSchemaColumn<I, ExtractColumnType<C>, BSLField<A, I, R, ExactColumnDef<C>>>;

/**
 * Configurator returned by Field(variantField) for VariantSchema.Field inputs.
 * Call with config to get the final BSLVariantField.
 * @internal
 */
type VariantConfigurator<VC extends BS.VariantSchema.Field.Config> = <const C extends Partial<ColumnDef> = {}>(
  config?: FieldConfig<C>
) => ValidateSchemaColumn<
  ExtractVariantSelectEncoded<VC>,
  ExtractColumnType<C>,
  BSLVariantField<VC, ExactColumnDef<C>>
>;

// ============================================================================
// Field Function (Curried API)
// ============================================================================

/**
 * Creates a BSLField from a plain Effect Schema (curried).
 * First call with schema, then call with column configuration.
 *
 * **Type Safety**: Validates that the schema's encoded type (I) is compatible
 * with the specified column type. Incompatible combinations result in a compile-time error type.
 *
 * @example
 * ```ts
 * // Valid combinations
 * Field(S.String)({ column: { type: "string" } })   // string -> text
 * Field(S.String)({ column: { type: "uuid" } })     // string -> uuid
 * Field(S.Int)({ column: { type: "integer" } })     // number -> integer
 * Field(S.Boolean)({ column: { type: "boolean" } }) // boolean -> boolean
 * Field(S.Struct({...}))({ column: { type: "json" } }) // object -> jsonb
 *
 * // Invalid combinations (compile error)
 * Field(S.String)({ column: { type: "integer" } })  // string incompatible with integer
 * Field(S.Int)({ column: { type: "uuid" } })        // number incompatible with uuid
 * ```
 *
 * @since 1.0.0
 * @category constructors
 */
export function Field<A, I, R>(schema: S.Schema<A, I, R>): SchemaConfigurator<A, I, R>;

/**
 * Creates a BSLVariantField from a VariantSchema.Field (curried).
 * First call with variant field, then call with column configuration.
 *
 * **Type Safety**: Validates that the variant field's "select" schema encoded type
 * is compatible with the specified column type. The "select" variant is used because it represents
 * the database row type.
 *
 * @since 1.0.0
 * @category constructors
 */
export function Field<VC extends BS.VariantSchema.Field.Config>(
  variantField: BS.VariantSchema.Field<VC>
): VariantConfigurator<VC>;

/**
 * Implementation of curried Field factory.
 * Returns a configurator function that accepts column config.
 */
export function Field<A, I, R>(
  input: S.Schema<A, I, R> | BS.VariantSchema.Field<BS.VariantSchema.Field.Config>
): <const C extends Partial<ColumnDef> = {}>(
  config?: FieldConfig<C>
) =>
  | BSLField<A, I, R, ExactColumnDef<C>>
  | BSLVariantField<BS.VariantSchema.Field.Config, ExactColumnDef<C>>
  | SchemaColumnError<unknown, ColumnType.Type> {
  // Return the configurator function
  return <const C extends Partial<ColumnDef> = {}>(config?: FieldConfig<C>) => {
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
    const schema = input as S.Schema<A, I, R>;

    // Attach column metadata via annotation
    const annotated = schema.annotations({
      [ColumnMetaSymbol]: columnDef,
    });

    // Also attach as a direct property for easy access without AST traversal
    return Object.assign(annotated, {
      [ColumnMetaSymbol]: columnDef,
    }) as BSLField<A, I, R, ExactColumnDef<C>>;
  };
}
