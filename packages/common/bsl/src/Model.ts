import { BS } from "@beep/schema";
import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import type { BSLField, BSLVariantField } from "./Field";
import type { BSL, ColumnDef, ModelClassWithVariants } from "./types";

import { ColumnMetaSymbol, isBSLVariantField, ModelVariant } from "./types";

/**
 * Check if the input is a VariantSchema.Field from either our local implementation
 * or from @effect/experimental/VariantSchema (used by @effect/sql/Model).
 * @internal
 */
const isAnyVariantField = (input: unknown): input is BS.VariantSchema.Field<BS.VariantSchema.Field.Config> =>
  BS.VariantSchema.isField(input) || BS.VariantSchema.isField(input);
// Snake case helper (POC: simple implementation)
const toSnakeCase = (str: string): string =>
  F.pipe(str, Str.replace(/([A-Z])/g, "_$1"), Str.toLowerCase, Str.replace(/^_/, ""));

// Type-level extraction of columns from fields
// Checks BSLVariantField first (has ColumnMetaSymbol), then BSLField, then fallback
export type ExtractColumnsType<Fields extends BSL.Fields> = {
  readonly [K in keyof Fields]: // Check BSLVariantField first (has column metadata via ColumnMetaSymbol)
  [Fields[K]] extends [BSLVariantField<UnsafeTypes.UnsafeAny, infer C>]
    ? C
    : // Check BSLField (plain schema with column metadata)
      [Fields[K]] extends [BSLField<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, infer C>]
      ? C
      : // Fallback for plain schemas or VariantSchema.Field without column metadata
        ColumnDef<"string", false, false, false, false>;
};

// Type-level extraction of primary key field names
// Checks BSLVariantField first, then BSLField
export type ExtractPrimaryKeys<Fields extends BSL.Fields> = {
  [K in keyof Fields]: // Check BSLVariantField first
  [Fields[K]] extends [BSLVariantField<UnsafeTypes.UnsafeAny, infer C>]
    ? C extends { primaryKey: true }
      ? K
      : never
    : // Check BSLField
      [Fields[K]] extends [BSLField<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, infer C>]
      ? C extends { primaryKey: true }
        ? K
        : never
      : never;
}[keyof Fields];

// Re-export from types for backwards compatibility
export type { ModelClass, ModelStatics } from "./types";

type MissingSelfGeneric<Params extends string = ""> =
  `Missing \`Self\` generic - use \`class Self extends Model<Self>()${Params}({ ... })\``;

// Helper to extract the AST from a field (handles both Schema and PropertySignature)
const getFieldAST = (field: S.Schema.All | S.PropertySignature.All): AST.AST => {
  if (S.isPropertySignature(field)) {
    // PropertySignature has an `ast` of type PropertySignatureDeclaration | PropertySignatureTransformation
    const psAst = field.ast;
    if (psAst._tag === "PropertySignatureDeclaration") {
      return psAst.type;
    }
    // PropertySignatureTransformation - use the 'from' side
    return psAst.from.type;
  }
  return field.ast;
};

// Default column definition used when no metadata is found
const defaultColumnDef: ColumnDef<"string", false, false, false, false> = {
  type: "string" as const,
  primaryKey: false,
  unique: false,
  nullable: false,
  autoIncrement: false,
};

/**
 * Extract column metadata from a field.
 * Checks multiple sources:
 * 1. Direct ColumnMetaSymbol property (BSLField, BSLVariantField)
 * 2. AST annotations (plain Schema)
 * @internal
 */
const getColumnDef = (field: unknown): ColumnDef => {
  // Case 1: Direct property access (BSLField or BSLVariantField)
  if (field !== null && typeof field === "object" && ColumnMetaSymbol in field) {
    const meta = (field as { [ColumnMetaSymbol]?: ColumnDef })[ColumnMetaSymbol];
    if (meta !== undefined) {
      return meta;
    }
  }

  // Case 2: Check AST annotations for Schema or PropertySignature
  if (S.isSchema(field) || S.isPropertySignature(field)) {
    const ast = getFieldAST(field as S.Schema.All | S.PropertySignature.All);
    return F.pipe(
      ast,
      AST.getAnnotation<ColumnDef>(ColumnMetaSymbol),
      O.getOrElse(() => defaultColumnDef)
    );
  }

  // Case 3: No metadata found, return default
  return defaultColumnDef;
};

// Extract column metadata from field annotations (runtime)
const extractColumns = <Fields extends BSL.Fields>(fields: Fields): ExtractColumnsType<Fields> =>
  F.pipe(
    fields,
    Struct.entries,
    A.map(([key, field]) => {
      const columnDef = getColumnDef(field);
      return [key, columnDef] as const;
    }),
    R.fromEntries
  ) as ExtractColumnsType<Fields>;

// Derive primary key fields (runtime)
const derivePrimaryKey = <Columns extends Record<string, ColumnDef>>(columns: Columns): readonly string[] =>
  F.pipe(
    columns,
    Struct.entries,
    A.filter(([_, def]) => def.primaryKey === true),
    A.map(([key]) => key)
  );

// ============================================================================
// VariantSchema Integration Helpers
// ============================================================================

/**
 * Create a VariantSchema instance configured for Model variants.
 * @internal
 */
const createModelVariantSchema = () =>
  BS.VariantSchema.make({
    variants: ModelVariant.Options,
    defaultVariant: ModelVariant.Enum.select,
  });

/**
 * Extracts the underlying schema from a BSLField.
 * For BSLField, the field itself is the schema.
 * For plain Schema, return as-is.
 * @internal
 */
const extractSchema = (field: S.Schema.All | S.PropertySignature.All): S.Schema.All | S.PropertySignature.All => {
  // BSLField extends Schema, so we can return it directly
  // The column metadata is in annotations, not affecting schema behavior
  return field;
};

/**
 * Converts BSL fields to VariantSchema-compatible field format.
 * - BSLVariantField: Pass through the underlying variant field schemas
 * - VariantSchema.Field (directly): Pass through as-is
 * - Plain BSLField or Schema: Wrap for all 6 variants via FieldOnly
 * @internal
 */
const toVariantFields = <Fields extends BSL.Fields>(
  fields: Fields,
  VS: ReturnType<typeof createModelVariantSchema>
): BS.VariantSchema.Struct.Fields =>
  F.pipe(
    fields,
    R.map((field) => {
      // Case 1: BSLVariantField (BSL-wrapped variant field with column metadata)
      // Check this first since isBSLVariantField is more specific
      if (isBSLVariantField(field)) {
        // Extract the underlying variant field's schemas and create a new Field
        return VS.Field(field.schemas as BS.VariantSchema.Field.ConfigWithKeys<ModelVariant.Type>);
      }
      // Case 2: Already a VariantSchema.Field (e.g., from M.Generated, M.Sensitive, etc.)
      // This handles both local VariantSchema and @effect/experimental/VariantSchema
      if (isAnyVariantField(field)) {
        // Pass through the field's schemas to create a compatible local VariantSchema.Field
        return VS.Field(
          (field as BS.VariantSchema.Field<BS.VariantSchema.Field.Config>)
            .schemas as BS.VariantSchema.Field.ConfigWithKeys<ModelVariant.Type>
        );
      }
      // Case 3: Plain BSLField or Schema - wrap for all 6 variants
      const schema = extractSchema(field as S.Schema.All | S.PropertySignature.All);
      return VS.FieldOnly(...ModelVariant.Options)(schema);
    })
  ) as BS.VariantSchema.Struct.Fields;

/**
 * Creates a BSL Model class with static properties for table metadata.
 * Also attaches 6 variant schema accessors: select, insert, update, json, jsonCreate, jsonUpdate.
 *
 * @example
 * ```typescript
 * class UserProfile extends Model<UserProfile>("UserProfile")({
 *   id: Field(S.String, { column: { type: "uuid", unique: true } }),
 *   _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
 * }) {}
 *
 * UserProfile.tableName  // "user_profile"
 * UserProfile.primaryKey // ["_rowId"]
 * UserProfile.columns.id // { type: "uuid", unique: true, ... }
 *
 * // Variant schemas (for models with Generated/Sensitive fields)
 * UserProfile.select     // Schema with all fields
 * UserProfile.insert     // Schema excluding Generated fields
 * UserProfile.json       // Schema excluding Sensitive fields
 * ```
 */
export const Model =
  <Self = never>(identifier: string) =>
  <const Fields extends BSL.Fields>(
    fields: Fields,
    annotations?: S.Annotations.Schema<Self>
  ): [Self] extends [never]
    ? MissingSelfGeneric<`("${typeof identifier}")`>
    : ModelClassWithVariants<
        Self,
        Fields,
        string,
        ExtractColumnsType<Fields>,
        readonly string[],
        typeof identifier
      > => {
    const columns = extractColumns(fields);
    const primaryKey = derivePrimaryKey(columns);
    const tableName = toSnakeCase(identifier);

    // Create internal VariantSchema instance for variant extraction
    const VS = createModelVariantSchema();

    // Convert BSL fields to VariantSchema fields
    const variantFields = toVariantFields(fields, VS);
    // Use type assertion since we've already transformed the fields correctly
    const vsStruct = VS.Struct(variantFields as UnsafeTypes.UnsafeAny);

    // Extract the "select" variant to get plain schema fields for the base class
    // This follows the same pattern as VariantSchema.Class
    // Note: VS.extract automatically handles isDefault since "select" is our defaultVariant
    const selectSchema = VS.extract(vsStruct, "select");

    // Create the base class using S.Class with extracted select variant fields
    class BaseClass extends S.Class<UnsafeTypes.UnsafeAny>(identifier)(selectSchema.fields, annotations) {
      static readonly tableName = tableName;
      static readonly columns = columns;
      static readonly primaryKey = primaryKey;
      static override readonly identifier = identifier;
      static readonly _fields = fields;
    }

    // Add 6 variant accessors using Object.defineProperty for lazy evaluation
    // We need our own cache since we add annotations after VariantSchema.extract
    const variantCache: Record<string, S.Schema.All> = {};

    for (const variant of ModelVariant.Options) {
      Object.defineProperty(BaseClass, variant, {
        get: () => {
          if (variantCache[variant] === undefined) {
            variantCache[variant] = VS.extract(vsStruct, variant).annotations({
              identifier: `${identifier}.${variant}`,
              title: `${identifier}.${variant}`,
            });
          }
          return variantCache[variant];
        },
        enumerable: true,
        configurable: false,
      });
    }

    return BaseClass as UnsafeTypes.UnsafeAny;
  };
