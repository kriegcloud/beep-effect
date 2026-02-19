import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type { Awaitable } from "@beep/types/promise.types";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";

const $I = $SharedDomainId.create("factories/model-builder/column-annotations");
export class StandardSchemaV1 extends S.Class<StandardSchemaV1>($I`StandardSchemaV1`)({
  "~standard": S.Struct({
    validate: S.declare(
      (
        i: unknown
      ): i is (
        value: unknown,
        options?: undefined | { readonly libraryOptions?: undefined | Record<string, unknown> }
      ) => any => P.isFunction(i)
    ),
  }),
}) {}
export const PrimaryKeyId = Symbol.for($I`PrimaryKey`);

export const ColumnType = Symbol.for($I`ColumnType`);

export const Default = Symbol.for($I`Default`);

export const AutoIncrement = Symbol.for($I`AutoIncrement`);

export const Unique = Symbol.for($I`Unique`);
const stringOrNumArrayLiteral = S.Union(
  S.TemplateLiteral(`"`, "string", `"`, "[]"),
  S.TemplateLiteral(`"`, "number", `"`, "[]")
);
export const DbFieldType = S.Union(
  S.Literal("string", "number", "boolean", "date", "json"),
  stringOrNumArrayLiteral,
  S.Array(
    S.Union(
      S.Literal(""),
      S.compose(
        S.String,
        S.Record({
          key: S.Never,
          value: S.Never,
        })
      )
    )
  )
);

export declare namespace DbFieldType {
  export type Type = typeof DbFieldType.Type;
  export type Encoded = typeof DbFieldType.Encoded;
}

export const DBPrimitive = S.Union(
  S.String,
  S.Number,
  S.Boolean,
  S.Date,
  S.Null,
  S.Undefined,
  S.Array(S.String),
  S.Array(S.Number),
  S.Union(S.Record({ key: S.String, value: S.Unknown }), S.Array(S.Unknown))
);

export declare namespace DBPrimitive {
  export type Type = typeof DBPrimitive.Type;
  export type Encoded = typeof DBPrimitive.Encoded;
}

// (value: DBPrimitive) => Awaitable<DBPrimitive>
const TransformFn = S.declare((i: unknown): i is (value: DBPrimitive.Type) => Awaitable<DBPrimitive.Type> =>
  P.isFunction(i)
);

export class DbFieldAttributeConfig extends S.Class<DbFieldAttributeConfig>($I`DbFieldAttributeConfig`)({
  /**
   * If the field should be required on a new record.
   * @default true
   */
  required: BS.BoolWithDefault(true),
  /**
   * If the value should be returned on a response body.
   * @default true
   */
  returned: BS.BoolWithDefault(true),
  /**
   * If a value should be provided when creating a new record.
   * @default true
   */
  input: BS.BoolWithDefault(true),
  /**
   * Default value for the field
   *
   * Note: This will not create a default value on the database level. It will only
   * be used when creating a new record.
   */
  defaultValue: S.optional(
    S.Union(
      DBPrimitive,
      S.declare((i: unknown): i is () => DBPrimitive.Type => P.isFunction(i))
    )
  ),
  /**
   * Update value for the field
   *
   * Note: This will create an onUpdate trigger on the database level for supported adapters.
   * It will be called when updating a record.
   */
  onUpdate: S.optional(TransformFn),

  /**
   * transform the value before storing it.
   */
  transform: S.optional(
    S.Struct({
      input: S.optional(TransformFn),
      output: S.optional(TransformFn),
    })
  ),
  /**
   * Reference to another model.
   */
  references: S.optional(
    S.Struct({
      model: S.String,
      field: S.String,
      onDelete: S.optional(S.Literal("no action", "restrict", "cascade", "set null", "set default")),
    })
  ),

  unique: S.optional(S.Boolean),
  /**
   * If the field should be a bigint on the database instead of integer.
   */
  bigint: S.optional(S.Boolean),
  /**
   * A zod schema to validate the value.
   */
  validator: S.optional(
    S.Struct({
      input: S.optional(StandardSchemaV1),
      output: S.optional(StandardSchemaV1),
    })
  ),
  /**
   * The name of the field on the database.
   */
  fieldName: S.optional(S.String),
  /**
   * If the field should be sortable.
   *
   * applicable only for `text` type.
   * It's useful to mark fields varchar instead of text.
   */
  sortable: BS.BoolWithDefault(false),
  /**
   * If the field should be indexed.
   * @default false
   */
  index: BS.BoolWithDefault(false),
}) {}

export declare namespace DbFieldAttributeConfig {
  export type Type = typeof DbFieldAttributeConfig.Type;
  export type Encoded = typeof DbFieldAttributeConfig.Encoded;
}

const applyAnnotations = <Schema extends S.Schema.All>(
  schema: Schema,
  overrides: Record<PropertyKey, unknown>
): Schema => {
  const identifier = AST.getIdentifierAnnotation(schema.ast);
  const shouldPreserveIdentifier = O.isSome(identifier) && !(AST.IdentifierAnnotationId in overrides);
  const annotations: Record<PropertyKey, unknown> = shouldPreserveIdentifier
    ? { ...overrides, [AST.IdentifierAnnotationId]: identifier.value }
    : overrides;

  return schema.annotations(annotations) as Schema;
};
/**
 * Adds a primary key annotation to a schema.
 */
export const withPrimaryKey = <Schema extends S.Schema.All>(schema: Schema) =>
  applyAnnotations(schema, { [PrimaryKeyId]: true });
/**
 * Validates that a schema is compatible with the specified SQLite column type
 */
const validateSchemaColumnTypeCompatibility = (
  _schema: S.Schema.All,
  _columnType: DbFieldAttributeConfig.Type
): void => {
  // TODO actually implement this
};
/**
 * Adds a column type annotation to a schema.
 */
export const withColumnType: {
  <Config extends DbFieldAttributeConfig.Type>(type: Config): <T extends S.Schema.All>(schema: T) => T;
  // TODO make type safe
  <T extends S.Schema.All, Config extends DbFieldAttributeConfig.Type>(schema: T, type: Config): T;
} = F.dual(2, <T extends S.Schema.All, Config extends DbFieldAttributeConfig>(schema: T, type: Config) => {
  validateSchemaColumnTypeCompatibility(schema, type);
  return applyAnnotations(schema, { [ColumnType]: type });
});

/**
 * Adds an auto-increment annotation to a schema.
 */
export const withAutoIncrement = <T extends S.Schema.All>(schema: T) =>
  applyAnnotations(schema, { [AutoIncrement]: true });

/**
 * Adds a unique constraint annotation to a schema.
 */
export const withUnique = <T extends S.Schema.All>(schema: T) => applyAnnotations(schema, { [Unique]: true });

/**
 * Adds a default value annotation to a schema.
 */
export const withDefault: {
  // TODO make type safe
  <T extends S.Schema.All>(schema: T, value: unknown): T;
  (value: unknown): <T extends S.Schema.All>(schema: T) => T;
} = F.dual(2, <T extends S.Schema.All>(schema: T, value: unknown) => applyAnnotations(schema, { [Default]: value }));
