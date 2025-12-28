import * as VariantSchema from "@beep/schema/core/VariantSchema";
import * as ExperimentalVariantSchema from "@effect/experimental/VariantSchema";
import * as P from "effect/Predicate";
import type * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import * as Struct from "effect/Struct";
import { deriveColumnType } from "./derive-column-type";
import { AutoIncrementTypeError, MissingVariantSchemaError } from "./errors";
import type { ColumnType } from "./literals.ts";
import type {
  ColumnDef,
  DerivedColumnDefFromSchema,
  DSLField,
  DSLVariantField,
  ExactColumnDef,
  ExtractVariantSelectSchema,
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

/**
 * Extracts AST from a Schema or VariantSchema.Field input.
 * For VariantFields, uses the "select" variant's schema as that represents the DB storage type.
 * @internal
 */
export const extractASTFromInput = (
  input:
    | S.Schema.All
    | VariantSchema.Field<VariantSchema.Field.Config>
    | ExperimentalVariantSchema.Field<ExperimentalVariantSchema.Field.Config>
): AST.AST => {
  if (isAnyVariantField(input)) {
    // For variant fields, use the "select" variant's schema
    const selectSchema = input.schemas.select;
    if (P.isNotNullable(selectSchema) && P.hasProperty("ast")(selectSchema)) {
      return (selectSchema as { ast: AST.AST }).ast;
    }
    // Fallback to first available schema
    const schemas = input.schemas as Record<string, unknown>;
    const schemaKeys = Struct.keys(schemas);
    for (const key of schemaKeys) {
      const schema = schemas[key];
      if (P.isNotNullable(schema) && P.isObject(schema) && P.hasProperty("ast")(schema)) {
        return (schema as { ast: AST.AST }).ast;
      }
    }
    throw new MissingVariantSchemaError({
      message: "VariantField has no schema with AST property",
      code: "INV-SQL-VS-001",
      severity: "error",
      path: ["extractASTFromInput", "VariantField"],
      expected: "At least one schema with 'ast' property in VariantField.schemas",
      received: `Schemas with keys: [${schemaKeys.join(", ")}] but none have 'ast' property`,
      suggestion:
        "Ensure the VariantField is constructed with valid Effect Schemas. " +
        "Check that at least one of 'select', 'insert', 'update', or 'json' schemas is defined and is a proper Effect Schema.",
      availableSchemaKeys: schemaKeys,
    });
  }
  // Plain Schema
  return (input as { ast: AST.AST }).ast;
};

// Re-export DSLField for backwards compatibility
export type { DSLField, DSLVariantField, SchemaColumnError };

/**
 * Helper type to extract column type from config, defaulting to "string".
 */
export type ExtractColumnType<C extends Partial<ColumnDef>> = C extends { type: infer T extends ColumnType.Type }
  ? T
  : "string";

// ============================================================================
// Configurator Types (returned by first curried call)
// ============================================================================

/**
 * Configurator returned by Field(schema) for plain Schema inputs.
 * Call with config to get the final DSLField.
 *
 * **Type Derivation**: When no explicit column type is provided, the type is
 * derived from the schema's class identity at the type level:
 * - `S.Int` → `"integer"` (distinguished from `S.Number`)
 * - `S.UUID` → `"uuid"` (distinguished from `S.String`)
 * - `S.Date` → `"datetime"`
 * - `S.BigInt` → `"bigint"` (from string)
 * - Other types fall back to encoded type derivation
 *
 * This provides precise type-level column type inference that matches runtime behavior.
 *
 * @typeParam Schema - The Effect Schema type (captured for class identity checks)
 */
export type SchemaConfiguratorWithSchema<Schema extends S.Schema.All> = <const C extends Partial<ColumnDef> = {}>(
  config?: FieldConfig<C>
) => C extends { type: ColumnType.Type }
  ? ValidateSchemaColumn<
      S.Schema.Encoded<Schema>,
      C["type"],
      DSLField<S.Schema.Type<Schema>, S.Schema.Encoded<Schema>, S.Schema.Context<Schema>, ExactColumnDef<C>>
    >
  : DSLField<
      S.Schema.Type<Schema>,
      S.Schema.Encoded<Schema>,
      S.Schema.Context<Schema>,
      DerivedColumnDefFromSchema<Schema, C>
    >;

/**
 * Configurator returned by Field(variantField) for local VariantSchema.Field inputs.
 * Call with config to get the final DSLVariantField.
 *
 * **Type Derivation**: When no explicit column type is provided, the type is
 * derived from the variant field's "select" schema using class identity checks.
 * This correctly infers `S.Int` → `"integer"`, `S.UUID` → `"uuid"`, etc.
 */
export type LocalVariantConfiguratorWithSchema<VC extends VariantSchema.Field.Config> = <
  const C extends Partial<ColumnDef> = {},
>(
  config?: FieldConfig<C>
) => C extends { type: ColumnType.Type }
  ? ValidateSchemaColumn<ExtractVariantSelectEncoded<VC>, C["type"], DSLVariantField<VC, ExactColumnDef<C>>>
  : DSLVariantField<VC, DerivedColumnDefFromSchema<ExtractVariantSelectSchema<VC>, C>>;

/**
 * Configurator returned by Field(variantField) for @effect/experimental VariantSchema.Field inputs.
 * Call with config to get the final DSLVariantField.
 *
 * **Type Derivation**: When no explicit column type is provided, the type is
 * derived from the variant field's "select" schema using class identity checks.
 * This correctly infers `S.Int` → `"integer"`, `S.UUID` → `"uuid"`, etc.
 */
export type ExperimentalVariantConfiguratorWithSchema<VC extends ExperimentalVariantSchema.Field.Config> = <
  const C extends Partial<ColumnDef> = {},
>(
  config?: FieldConfig<C>
) => C extends { type: ColumnType.Type }
  ? ValidateSchemaColumn<ExtractVariantSelectEncoded<VC>, C["type"], DSLVariantField<VC, ExactColumnDef<C>>>
  : DSLVariantField<VC, DerivedColumnDefFromSchema<ExtractVariantSelectSchema<VC>, C>>;

/**
 * Extracts the encoded type from a variant config's "select" schema.
 * @internal
 */
type ExtractVariantSelectEncoded<VC> = VC extends { select: infer SelectSchema }
  ? [SelectSchema] extends [S.Schema<infer _A, infer I, infer _R>]
    ? I
    : [SelectSchema] extends [
          S.PropertySignature<infer _TT, infer _T, infer _K, infer _ET, infer I, infer _HD, infer _C>,
        ]
      ? I
      : unknown
  : unknown;

// ============================================================================
// Field Function (Curried API)
// ============================================================================

/**
 * Creates a DSLField from a plain Effect Schema (curried).
 * First call with schema, then call with column configuration.
 *
 * **Type Safety**: Validates that the schema's encoded type (I) is compatible
 * with the specified column type. Incompatible combinations result in a compile-time error type.
 *
 * **Precise Type Derivation**: Uses schema class identity to correctly derive column types:
 * - `Field(S.Int)({})` → column type `"integer"` (not `"number"`)
 * - `Field(S.UUID)({})` → column type `"uuid"` (not `"string"`)
 * - `Field(S.Date)({})` → column type `"datetime"` (not `"string"`)
 *
 * @example
 * ```ts
 * // Valid combinations with precise type inference
 * Field(S.String)({})                               // type: "string"
 * Field(S.Int)({})                                  // type: "integer" (precise!)
 * Field(S.UUID)({})                                 // type: "uuid" (precise!)
 * Field(S.Date)({})                                 // type: "datetime" (precise!)
 *
 * // Explicit type overrides
 * Field(S.String)({ column: { type: "uuid" } })     // string -> uuid
 * Field(S.Int)({ column: { type: "integer" } })     // number -> integer
 *
 * // Invalid combinations (compile error)
 * Field(S.String)({ column: { type: "integer" } })  // string incompatible with integer
 * Field(S.Int)({ column: { type: "uuid" } })        // number incompatible with uuid
 * ```
 *
 * @since 1.0.0
 * @category constructors
 */
export function Field<Schema extends S.Schema.All>(schema: Schema): SchemaConfiguratorWithSchema<Schema>;

/**
 * Creates a DSLVariantField from a local VariantSchema.Field (curried).
 * First call with variant field, then call with column configuration.
 *
 * **Type Safety**: Validates that the variant field's "select" schema encoded type
 * is compatible with the specified column type. The "select" variant is used because it represents
 * the database row type.
 *
 * **Precise Type Derivation**: Uses the "select" schema's class identity to correctly derive:
 * - `Field(M.Generated(S.Int))({})` → column type `"integer"`
 * - `Field(M.FieldOption(S.UUID))({})` → column type `"uuid"`
 *
 * @since 1.0.0
 * @category constructors
 */
export function Field<VC extends VariantSchema.Field.Config>(
  variantField: VariantSchema.Field<VC>
): LocalVariantConfiguratorWithSchema<VC>;

/**
 * Creates a DSLVariantField from an @effect/experimental/VariantSchema.Field (curried).
 * First call with variant field, then call with column configuration.
 * This overload handles M.Generated, M.Sensitive, M.GeneratedByApp, M.FieldOption, etc.
 *
 * **Type Safety**: Validates that the variant field's "select" schema encoded type
 * is compatible with the specified column type. The "select" variant is used because it represents
 * the database row type.
 *
 * **Precise Type Derivation**: Uses the "select" schema's class identity to correctly derive:
 * - `Field(M.Generated(S.Int))({})` → column type `"integer"`
 * - `Field(M.FieldOption(S.UUID))({})` → column type `"uuid"`
 *
 * @since 1.0.0
 * @category constructors
 */
export function Field<VC extends ExperimentalVariantSchema.Field.Config>(
  variantField: ExperimentalVariantSchema.Field<VC>
): ExperimentalVariantConfiguratorWithSchema<VC>;

/**
 * Implementation of curried Field factory.
 * Returns a configurator function that accepts column config.
 */
export function Field<A, I, R>(
  input:
    | S.Schema<A, I, R>
    | VariantSchema.Field<VariantSchema.Field.Config>
    | ExperimentalVariantSchema.Field<ExperimentalVariantSchema.Field.Config>
): <const C extends Partial<ColumnDef> = {}>(
  config?: FieldConfig<C>
) =>
  | DSLField<A, I, R, ColumnDef>
  | DSLVariantField<VariantSchema.Field.Config, ColumnDef>
  | SchemaColumnError<unknown, ColumnType.Type> {
  // Return the configurator function
  return <const C extends Partial<ColumnDef> = {}>(config?: FieldConfig<C>) => {
    const columnDef = {
      type: config?.column?.type ?? deriveColumnType(extractASTFromInput(input)),
      primaryKey: config?.column?.primaryKey ?? false,
      unique: config?.column?.unique ?? false,
      autoIncrement: config?.column?.autoIncrement ?? false,
      defaultValue: config?.column?.defaultValue,
    } as ExactColumnDef<C>;

    // INV-SQL-AI-001: Validate autoIncrement requires integer/bigint type
    if (columnDef.autoIncrement === true && columnDef.type !== "integer" && columnDef.type !== "bigint") {
      throw new AutoIncrementTypeError({
        message: `AutoIncrement requires integer or bigint type, but field has type '${columnDef.type}'`,
        code: "INV-SQL-AI-001",
        severity: "error",
        path: ["Field", "autoIncrement"],
        expected: "'integer' or 'bigint'",
        received: `'${columnDef.type}'`,
        suggestion: "Change column type to 'integer' or 'bigint', or remove autoIncrement",
        fieldName: "(unknown - set at Model definition)",
        actualType: columnDef.type,
      });
    }

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
  };
}
