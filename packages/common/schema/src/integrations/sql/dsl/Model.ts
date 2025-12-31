import { variance } from "@beep/schema/core/variance";
import type { UnsafeTypes } from "@beep/types";
import { thunk, thunkEmptyReadonlyArray } from "@beep/utils";
import * as VariantSchema from "@effect/experimental/VariantSchema";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { TypeId } from "effect/Schema";
import * as AST from "effect/SchemaAST";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import {
  type DSLValidationError,
  EmptyModelIdentifierError,
  IdentifierTooLongError,
  InvalidIdentifierCharsError,
  ModelValidationAggregateError,
  MultipleAutoIncrementError,
  NullablePrimaryKeyError,
} from "./errors";
import type { DSLField, DSLVariantField } from "./Field";
import { ModelVariant } from "./literals.ts";
import { isNullable } from "./nullability";

import type { ColumnDef, DSL, ModelClassWithVariants, RelationsConfig } from "./types";
import { ColumnMetaSymbol, isDSLVariantField } from "./types";

/**
 * Check if the input is a VariantSchema.Field from either our local implementation
 * or from @effect/experimental/VariantSchema (used by @effect/sql/Model).
 * @internal
 */
const isAnyVariantField = (input: unknown): input is VariantSchema.Field<VariantSchema.Field.Config> =>
  VariantSchema.isField(input);

// Type-level extraction of columns from fields
// Checks DSLVariantField first (has ColumnMetaSymbol), then DSLField, then fallback
export type ExtractColumnsType<Fields extends DSL.Fields> = {
  readonly [K in keyof Fields]: // Check DSLVariantField first (has column metadata via ColumnMetaSymbol)
  [Fields[K]] extends [DSLVariantField<UnsafeTypes.UnsafeAny, infer C>]
    ? C
    : // Check DSLField (plain schema with column metadata)
      [Fields[K]] extends [DSLField<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, infer C>]
      ? C
      : // Fallback for plain schemas or VariantSchema.Field without column metadata
        ColumnDef<"string", false, false, false>;
};

// Type-level extraction of primary key field names
// Checks DSLVariantField first, then DSLField
export type ExtractPrimaryKeys<Fields extends DSL.Fields> = {
  [K in keyof Fields]: // Check DSLVariantField first
  [Fields[K]] extends [DSLVariantField<UnsafeTypes.UnsafeAny, infer C>]
    ? C extends { primaryKey: true }
      ? K
      : never
    : // Check DSLField
      [Fields[K]] extends [DSLField<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, infer C>]
      ? C extends { primaryKey: true }
        ? K
        : never
      : never;
}[keyof Fields];

// Re-export from types for backwards compatibility
export type { ModelClass, ModelStatics } from "./types";

type MissingSelfGeneric<Params extends string = ""> =
  `Missing \`Self\` generic - use \`class Self extends Model<Self>${Params}('table_name', { ... })\``;

// Helper to extract the AST from a field (handles both Schema and PropertySignature)
const getFieldAST = (field: S.Schema.All | S.PropertySignature.All): AST.AST => {
  if (S.isPropertySignature(field)) {
    // PropertySignature has an `ast` of type PropertySignatureDeclaration | PropertySignatureTransformation
    const psAst = field.ast;
    return Match.value(psAst).pipe(
      Match.tag("PropertySignatureDeclaration", (ast) => ast.type),
      Match.tag("PropertySignatureTransformation", (ast) => ast.from.type),
      Match.exhaustive
    );
  }
  return field.ast;
};

// Default column definition used when no metadata is found
// Note: nullable is no longer stored in ColumnDef - it's derived from the schema AST
const defaultColumnDef: ColumnDef<"string", false, false, false> = {
  type: "string" as const,
  primaryKey: false,
  unique: false,
  autoIncrement: false,
};

/**
 * Extract column metadata from a field.
 * Checks multiple sources:
 * 1. Direct ColumnMetaSymbol property (DSLField, DSLVariantField)
 * 2. AST annotations (plain Schema)
 * @internal
 */
const getColumnDef = (field: unknown): ColumnDef => {
  // Case 1: Direct property access (DSLField or DSLVariantField)
  if (P.isNotNull(field) && P.isObject(field) && ColumnMetaSymbol in field) {
    const meta = (field as { [ColumnMetaSymbol]?: ColumnDef })[ColumnMetaSymbol];
    if (meta !== undefined) {
      return meta;
    }
  }

  // Case 2: Check AST annotations for Schema or PropertySignature
  if (S.isSchema(field) || S.isPropertySignature(field)) {
    const ast = getFieldAST(field as S.Schema.All | S.PropertySignature.All);
    return F.pipe(ast, AST.getAnnotation<ColumnDef>(ColumnMetaSymbol), O.getOrElse(thunk(defaultColumnDef)));
  }

  // Case 3: No metadata found, return default
  return defaultColumnDef;
};

// Extract column metadata from field annotations (runtime)
const extractColumns = <Fields extends DSL.Fields>(fields: Fields): ExtractColumnsType<Fields> =>
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
// Validation Constants
// ============================================================================

const POSTGRES_MAX_IDENTIFIER_LENGTH = 63;
const SQL_IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_$]*$/;
const INVALID_CHAR_PATTERN = /[^a-zA-Z0-9_$]/g;

// ============================================================================
// Model Validation
// ============================================================================

/**
 * Validates all Model invariants and throws on first error.
 * @internal
 */
const validateModelInvariants = <Fields extends DSL.Fields>(
  identifier: string,
  fields: Fields,
  columns: Record<string, ColumnDef>
): void => {
  const errors: DSLValidationError[] = [];

  // INV-MODEL-ID-001: Model identifier cannot be empty
  if (F.pipe(identifier, Str.isEmpty)) {
    errors.push(
      new EmptyModelIdentifierError({
        message: "Model identifier cannot be empty",
        code: "INV-MODEL-ID-001",
        severity: "error",
        path: ["Model", "identifier"],
        expected: "Non-empty string identifier",
        received: "Empty string",
        suggestion: "Provide a meaningful identifier like 'User', 'Order', 'Product'",
      })
    );
  }

  // INV-SQL-ID-001: Model identifier length
  const identifierLength = F.pipe(identifier, Str.length);
  if (identifierLength > POSTGRES_MAX_IDENTIFIER_LENGTH) {
    errors.push(
      new IdentifierTooLongError({
        message: `Model identifier '${identifier}' exceeds PostgreSQL maximum length of ${POSTGRES_MAX_IDENTIFIER_LENGTH} characters`,
        code: "INV-SQL-ID-001",
        severity: "error",
        path: ["Model", identifier],
        expected: `<= ${POSTGRES_MAX_IDENTIFIER_LENGTH} characters`,
        received: `${identifierLength} characters`,
        suggestion: `Shorten the identifier to ${POSTGRES_MAX_IDENTIFIER_LENGTH} characters or less`,
        identifier,
        length: identifierLength,
        maxLength: POSTGRES_MAX_IDENTIFIER_LENGTH,
      })
    );
  }

  // INV-SQL-ID-002: Model identifier valid characters
  if (F.pipe(identifier, Str.isNonEmpty) && !SQL_IDENTIFIER_PATTERN.test(identifier)) {
    const invalidChars = F.pipe(
      O.fromNullable(identifier.match(INVALID_CHAR_PATTERN)),
      O.map((m) => F.pipe(m, A.fromIterable, A.dedupe)),
      O.getOrElse(thunkEmptyReadonlyArray<string>)
    );
    errors.push(
      new InvalidIdentifierCharsError({
        message: `Model identifier '${identifier}' contains invalid characters for SQL`,
        code: "INV-SQL-ID-002",
        severity: "error",
        path: ["Model", identifier],
        expected:
          "Letters (a-z, A-Z), digits (0-9), underscores (_), dollar signs ($); must start with letter or underscore",
        received: `Contains: ${F.pipe(invalidChars, A.join(", "))}`,
        suggestion: "Use only valid SQL identifier characters",
        identifier,
        invalidChars,
      })
    );
  }

  // INV-MODEL-AI-001: At most one autoIncrement field
  const autoIncrementFields = F.pipe(
    columns,
    Struct.entries,
    A.filter(([_, def]) => def.autoIncrement === true),
    A.map(([key]) => key)
  );
  if (F.pipe(autoIncrementFields, A.drop(1), A.isNonEmptyArray)) {
    errors.push(
      new MultipleAutoIncrementError({
        message: `Model '${identifier}' has ${A.length(autoIncrementFields)} autoIncrement fields, but only one is allowed`,
        code: "INV-MODEL-AI-001",
        severity: "error",
        path: [identifier, "autoIncrement"],
        expected: "At most one autoIncrement field per model",
        received: `Fields: ${F.pipe(autoIncrementFields, A.join(", "))}`,
        suggestion: "Remove autoIncrement from all but one field",
        modelName: identifier,
        autoIncrementFields,
      })
    );
  }

  // Validate each field
  F.pipe(
    fields,
    Struct.entries,
    A.forEach(([fieldName, field]) => {
      const columnDef = columns[fieldName];
      if (!columnDef) return;

      // INV-SQL-ID-001: Field identifier length
      const fieldNameLength = F.pipe(fieldName, Str.length);
      if (fieldNameLength > POSTGRES_MAX_IDENTIFIER_LENGTH) {
        errors.push(
          new IdentifierTooLongError({
            message: `Field '${fieldName}' exceeds PostgreSQL maximum identifier length of ${POSTGRES_MAX_IDENTIFIER_LENGTH} characters`,
            code: "INV-SQL-ID-001",
            severity: "error",
            path: [identifier, fieldName],
            expected: `<= ${POSTGRES_MAX_IDENTIFIER_LENGTH} characters`,
            received: `${fieldNameLength} characters`,
            suggestion: `Shorten the field name to ${POSTGRES_MAX_IDENTIFIER_LENGTH} characters or less`,
            identifier: fieldName,
            length: fieldNameLength,
            maxLength: POSTGRES_MAX_IDENTIFIER_LENGTH,
          })
        );
      }

      // INV-SQL-ID-002: Field identifier valid characters
      if (!SQL_IDENTIFIER_PATTERN.test(fieldName)) {
        const invalidChars = F.pipe(
          O.fromNullable(fieldName.match(INVALID_CHAR_PATTERN)),
          O.map((m) => F.pipe(m, A.fromIterable, A.dedupe)),
          O.getOrElse(thunkEmptyReadonlyArray<string>)
        );
        errors.push(
          new InvalidIdentifierCharsError({
            message: `Field '${fieldName}' contains invalid characters for SQL`,
            code: "INV-SQL-ID-002",
            severity: "error",
            path: [identifier, fieldName],
            expected:
              "Letters (a-z, A-Z), digits (0-9), underscores (_), dollar signs ($); must start with letter or underscore",
            received: `Contains: ${F.pipe(invalidChars, A.join(", "))}`,
            suggestion: "Use only valid SQL identifier characters",
            identifier: fieldName,
            invalidChars,
          })
        );
      }

      // INV-SQL-PK-001: Primary key non-nullability
      if (columnDef.primaryKey === true) {
        // Extract AST from field to check nullability
        let fieldAST: AST.AST | null = null;
        if (isDSLVariantField(field)) {
          const selectSchema = field.schemas?.select;
          if (P.isNotNullable(selectSchema) && P.isObject(selectSchema) && P.hasProperty("ast")(selectSchema)) {
            fieldAST = (selectSchema as { ast: AST.AST }).ast;
          }
        } else if (S.isSchema(field)) {
          fieldAST = field.ast;
        } else if (S.isPropertySignature(field)) {
          const psAst = field.ast;
          fieldAST = Match.value(psAst).pipe(
            Match.tag("PropertySignatureDeclaration", (ast) => ast.type),
            Match.tag("PropertySignatureTransformation", (ast) => ast.from.type),
            Match.exhaustive
          );
        }

        if (fieldAST && isNullable(fieldAST)) {
          errors.push(
            new NullablePrimaryKeyError({
              message: `Primary key field '${fieldName}' cannot be nullable`,
              code: "INV-SQL-PK-001",
              severity: "error",
              path: [identifier, fieldName, "primaryKey"],
              expected: "Non-nullable schema (e.g., S.String, S.Int)",
              received: "Nullable schema (e.g., S.NullOr, S.optional)",
              suggestion: "Remove S.NullOr or S.optional wrapper from the schema, or remove primaryKey constraint",
              fieldName,
            })
          );
        }
      }
    })
  );

  // Throw aggregated error if any validations failed
  if (A.isNonEmptyArray(errors)) {
    const errorMessages = F.pipe(
      errors,
      A.map((e) => `  - [${e.code}] ${e.message}`)
    );
    throw new ModelValidationAggregateError({
      message: `Model '${identifier}' has ${A.length(errors)} validation error(s):\n${F.pipe(errorMessages, A.join("\n"))}`,
      code: "INV-MODEL-VALIDATE-001",
      severity: "error",
      path: [identifier],
      modelName: identifier,
      errorCount: A.length(errors),
      errors,
    });
  }
};

// ============================================================================
// VariantSchema Integration Helpers
// ============================================================================

/**
 * Create a VariantSchema instance configured for Model variants.
 * @internal
 */
const createModelVariantSchema = thunk(
  VariantSchema.make({
    variants: ModelVariant.Options,
    defaultVariant: ModelVariant.Enum.select,
  })
);
/**
 * Extracts the underlying schema from a DSLField.
 * For DSLField, the field itself is the schema.
 * For plain Schema, return as-is.
 * @internal
 */
const extractSchema = (field: S.Schema.All | S.PropertySignature.All): S.Schema.All | S.PropertySignature.All => {
  // DSLField extends Schema, so we can return it directly
  // The column metadata is in annotations, not affecting schema behavior
  return field;
};

/**
 * Converts DSL fields to VariantSchema-compatible field format.
 * - DSLVariantField: Pass through the underlying variant field schemas
 * - VariantSchema.Field (directly): Pass through as-is
 * - Plain DSLField or Schema: Wrap for all 6 variants via FieldOnly
 * @internal
 */
const toVariantFields = <Fields extends DSL.Fields>(
  fields: Fields,
  VS: ReturnType<typeof createModelVariantSchema>
): VariantSchema.Struct.Fields =>
  F.pipe(
    fields,
    R.map((field) => {
      // Case 1: DSLVariantField (DSL-wrapped variant field with column metadata)
      // Check this first since isDSLVariantField is more specific
      if (isDSLVariantField(field)) {
        // Extract the underlying variant field's schemas and create a new Field
        return VS.Field(field.schemas as VariantSchema.Field.ConfigWithKeys<ModelVariant.Type>);
      }
      // Case 2: Already a VariantSchema.Field (e.g., from M.Generated, M.Sensitive, etc.)
      // This handles both local VariantSchema and @effect/experimental/VariantSchema
      if (isAnyVariantField(field)) {
        // Pass through the field's schemas to create a compatible local VariantSchema.Field
        return VS.Field(
          (field as VariantSchema.Field<VariantSchema.Field.Config>)
            .schemas as VariantSchema.Field.ConfigWithKeys<ModelVariant.Type>
        );
      }
      // Case 3: Plain DSLField or Schema - wrap for all 6 variants
      const schema = extractSchema(field as S.Schema.All | S.PropertySignature.All);
      return VS.FieldOnly(...ModelVariant.Options)(schema);
    })
  );

/**
 * Configuration object for Model creation.
 * @since 1.0.0
 * @category models
 */
export interface ModelConfig<Self, Relations extends RelationsConfig = RelationsConfig> {
  /** Model-level relation definitions */
  readonly relations?: Relations;
  /** Schema annotations for the Model class */
  readonly annotations?: S.Annotations.Schema<Self>;
}

/**
 * Creates a DSL Model class with static properties for table metadata.
 * Also attaches 6 variant schema accessors: select, insert, update, json, jsonCreate, jsonUpdate.
 *
 * The Model function uses a two-step curried call:
 * 1. `Model<Self>("Identifier")` - provides the Self type and display identifier (can be PascalCase)
 * 2. `("table_name", fields, config?)` - provides the snake_case table name, field definitions, and optional config
 *
 * The tableName MUST be a valid snake_case string (lowercase letters and underscores only,
 * must start with a lowercase letter, no consecutive or trailing underscores).
 *
 * @example
 * ```typescript
 * // Basic model without relations
 * class UserProfile extends Model<UserProfile>("UserProfile")("user_profile", {
 *   id: Field(S.String)({ column: { type: "uuid", unique: true } }),
 *   _rowId: Field(S.Int)({ column: { type: "integer", primaryKey: true, autoIncrement: true } }),
 * }) {}
 *
 * UserProfile.identifier // "UserProfile" (display name)
 * UserProfile.tableName  // "user_profile" (literal type preserved!)
 * UserProfile.primaryKey // ["_rowId"]
 * UserProfile.columns.id // { type: "uuid", unique: true, ... }
 *
 * // Model with relations
 * class Post extends Model<Post>("Post")("post", {
 *   id: Field(PostId)({ column: { type: "uuid", primaryKey: true } }),
 *   authorId: Field(UserId)({ column: { type: "uuid" } }),
 * }, {
 *   relations: {
 *     author: Relation.one(() => User, { from: "authorId", to: "id" }),
 *   },
 * }) {}
 *
 * Post.relations.author // OneRelation<User, "authorId", "id">
 * ```
 */
export const Model =
  <Self = never, const Id extends string = string>(identifier: Id) =>
  <const Fields extends DSL.Fields, const TableName extends string, const Relations extends RelationsConfig = {}>(
    tableName: TableName,
    fields: Fields,
    config?: ModelConfig<Self, Relations>
  ): [Self] extends [never]
    ? MissingSelfGeneric<`("${Id}")`>
    : ModelClassWithVariants<Self, Fields, TableName, ExtractColumnsType<Fields>, readonly string[], Id, Relations> => {
    const columns = extractColumns(fields);

    // Validate all invariants before proceeding
    validateModelInvariants(identifier, fields, columns as Record<string, ColumnDef>);

    const primaryKey = derivePrimaryKey(columns);

    // Create internal VariantSchema instance for variant extraction
    const VS = createModelVariantSchema();

    // Convert DSL fields to VariantSchema fields
    const variantFields = toVariantFields(fields, VS);
    // Use type assertion since we've already transformed the fields correctly
    const vsStruct = VS.Struct(variantFields as UnsafeTypes.UnsafeAny);

    // Extract the "select" variant to get plain schema fields for the base class
    // This follows the same pattern as VariantSchema.Class
    // Note: VS.extract automatically handles isDefault since "select" is our defaultVariant
    const selectSchema = VS.extract(vsStruct, "select");

    // Create the base class using S.Class with extracted select variant fields
    // We use UnsafeAny to bypass TypeScript's limitations with extending class expressions
    class BaseClass extends S.Class<UnsafeTypes.UnsafeAny>(identifier)(selectSchema.fields, config?.annotations) {
      // Override TypeId with covariant variance markers to allow assignment to AnyModelClass
      // Without this, Schema's invariant Self type prevents ModelClass<User> from being
      // assignable to ModelClass<unknown>, requiring "as unknown as AnyModelClass" casts
      static override [TypeId] = variance;
      static readonly tableName = tableName;
      static readonly columns = columns;
      static readonly primaryKey = primaryKey;
      static override readonly identifier = identifier;
      static readonly _fields = fields;
      static readonly relations = (config?.relations ?? {}) as Relations;
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
