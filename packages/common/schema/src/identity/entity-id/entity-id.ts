import {invariant} from "@beep/invariant";
import type {DefaultAnnotations} from "@beep/schema/core";
import {mergeSchemaAnnotations} from "@beep/schema/core/annotations/built-in-annotations";
import type {$Type, HasDefault, HasRuntimeDefault, IsPrimaryKey, NotNull} from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import * as A from "effect/Array";
import type * as B from "effect/Brand";
import type * as FastCheck from "effect/FastCheck";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import {TypeId} from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import * as Str from "effect/String";
import {variance} from "../../core/variance";
import {SnakeTag} from "../../primitives/string/string";
import {UUIDLiteralEncoded} from "./uuid";


export declare namespace EntityId {
  export type SchemaType<TableName extends string> =
    S.TemplateLiteral<`${SnakeTag.Literal<TableName>}__${string}-${string}-${string}-${string}-${string}`>;
  export type PublicId<TableName extends string> = HasRuntimeDefault<
    HasDefault<
      $Type<
        NotNull<pg.PgTextBuilderInitial<"id", [string, ...string[]]>>,
        `${SnakeTag.Literal<TableName>}__${string}-${string}-${string}-${string}-${string}`
      >
    >
  >;
  export type PrivateId<Brand extends string> = $Type<
    IsPrimaryKey<NotNull<NotNull<pg.PgSerialBuilderInitial<"_row_id">>>>,
    B.Branded<number, Brand>
  >;
  export type Config<Brand extends string, TableName extends string> = {
    readonly tableName: SnakeTag.Literal<TableName>;
    readonly brand: Brand;
    readonly annotations?: undefined | Omit<DefaultAnnotations<Type<TableName>>, "title" | "identifier">;
  };

  export type DataTypeSchema<TableName extends string> =
    S.TemplateLiteral<`${SnakeTag.Literal<TableName>}__${string}-${string}-${string}-${string}-${string}`>;

  /**
   * The runtime data type - just the template literal string.
   * This is what Schema.Type resolves to.
   */
  export type Type<TableName extends string> = S.Schema.Type<DataTypeSchema<TableName>>;

  /**
   * Schema class instance with static properties for entity ID utilities.
   *
   * The Type parameter in AnnotableClass is ONLY the runtime data type (template literal string).
   * Static properties/methods are declared on the interface itself, NOT on the Type parameter.
   */
  export interface SchemaInstance<TableName extends string, Brand extends string>
    extends S.AnnotableClass<
      SchemaInstance<TableName, Brand>,
      Type<TableName>, // ← ONLY the template literal string, not the class properties
      Type<TableName>, // I (Encoded) - same as Type for this schema
      never // R (Context) - no context requirements
    > {
    readonly [TypeId]: typeof variance;
    readonly create: () => Type<TableName>;
    readonly tableName: SnakeTag.Literal<TableName>;
    readonly brand: Brand;
    readonly is: (u: unknown) => u is Type<TableName>;
    readonly publicId: () => PublicId<TableName>;
    readonly privateId: () => PrivateId<Brand>;
    readonly privateIdColumnNameSql: "_row_id";
    readonly privateIdColumnName: "_rowId";
    readonly publicIdColumnNameSql: "id";
    readonly publicIdColumnName: "id";
    readonly privateSchema: S.brand<S.refine<number, typeof S.NonNegative>, Brand>;
    readonly modelIdSchema: S.optionalWith<
      DataTypeSchema<TableName>,
      {
        exact: true;
        default: () => Type<TableName>;
      }
    >;
    readonly modelRowIdSchema: S.brand<S.refine<number, typeof S.NonNegative>, Brand>;
    readonly make: (input: string) => Type<TableName>;
    readonly makePrivateId: (input: number) => B.Branded<number, Brand>;
  }
}

const makeIdentifier = (brand: string) => (Str.endsWith("Id")(brand) ? brand : Str.concat("Id")(brand));

const makeTitle = <const TableName extends string>(tableName: SnakeTag.Literal<TableName>) =>
  F.pipe(tableName, Str.split("_"), A.map(Str.capitalize), A.join(" "), Str.concat(" Id"));

const makeDescription = <const TableName extends string>(tableName: SnakeTag.Literal<TableName>) =>
  F.pipe(Str.concat(tableName)("Entity identifier for "), Str.concat(" records."));

const makeFormat = <const TableName extends string>(tableName: SnakeTag.Literal<TableName>) =>
  F.pipe(tableName, Str.concat("__${string}-${string}-${string}-${string}-${string}"));

const makeCreateFn =
  <const TableName extends string>(tableName: SnakeTag.Literal<TableName>) =>
    () => F.pipe(tableName, Str.concat("__"), Str.concat(UUIDLiteralEncoded.create()));
const getDefaultEntityIdAST = <Config extends EntityId.Config<string, string>>(config: Config) => {
  return S.TemplateLiteral(config.tableName, "__", UUIDLiteralEncoded).ast;
};

export function makeEntityIdSchemaInstance<const TableName extends string, const Brand extends string>(
  config: {
    tableName: SnakeTag.Literal<TableName>;
    brand: Brand;
    annotations?: undefined | Omit<DefaultAnnotations<EntityId.Type<TableName>>, "title" | "identifier">;
  },
  ast?: AST.AST | undefined
): EntityId.SchemaInstance<TableName, Brand> {
  const identifier = makeIdentifier(config.brand);
  const title = makeTitle(config.tableName);
  const description = makeDescription(config.tableName);
  const jsonSchema = {
    type: "string",
    format: makeFormat(config.tableName),
  };
  const create = makeCreateFn(config.tableName);
  const arbitrary = () => (fc: typeof FastCheck) => fc.constantFrom(null).map(() => create());
  const pretty = () => (value: string) => `${config.brand}(${value})`;
  // Create the schema - TypeScript infers this with AppendType wrappers, but we know it resolves to our Type
  const schema = S.TemplateLiteral(
    config.tableName,
    "__",
    UUIDLiteralEncoded
  ) as unknown as EntityId.DataTypeSchema<TableName>;
  const schemaAST = ast ?? getDefaultEntityIdAST(config);
  invariant(S.is(SnakeTag)(config.tableName), "TableName must be a lowercase snake case string", {
    file: "@beep/schema/identity/entity-id/entity-id.ts",
    line: 188,
    args: [config.tableName],
  });

  const defaultAST = mergeSchemaAnnotations(schemaAST, {
    identifier,
    title,
    description,
    jsonSchema,
    arbitrary,
    pretty,
  });
  const privateSchema = S.NonNegativeInt.pipe(S.brand(config.brand));
  const modelRowIdSchema = privateSchema;

  const publicId = pg
    .text("id")
    .notNull()
    .unique()
    .$type<EntityId.Type<TableName>>()
    .$defaultFn(() => create());

  const privateId = pg.serial("_row_id").notNull().primaryKey().$type<B.Branded<number, Brand>>();

  // Wrap S.is to match the simpler signature expected by the interface
  const schemaIs = S.is(schema);
  const isGuard = (u: unknown): u is EntityId.Type<TableName> => schemaIs(u);

  return class EntityIdClass extends S.make<EntityId.Type<TableName>>(defaultAST) {
    static override annotations(
      annotations: S.Annotations.Schema<EntityId.Type<TableName>>
    ): EntityId.SchemaInstance<TableName, Brand> {
      return makeEntityIdSchemaInstance(config, mergeSchemaAnnotations(defaultAST, annotations));
    }

    override [TypeId] = variance;
    static override [TypeId] = variance;
    static readonly create = create;
    static readonly tableName = config.tableName;
    static readonly brand = config.brand;
    static readonly is = isGuard;
    static readonly publicId = () => publicId;
    static readonly privateId = () => privateId;
    static readonly privateSchema = privateSchema;
    static readonly privateIdColumnNameSql = "_row_id" as const;
    static readonly privateIdColumnName = "_rowId" as const;
    static readonly publicIdColumnNameSql = "id" as const;
    static readonly publicIdColumnName = "id" as const;
    static readonly modelIdSchema = S.optionalWith(schema, {
      exact: true,
      default: () => create(),
    });
    static readonly modelRowIdSchema = modelRowIdSchema;
    static readonly make = (input: string) => {
      invariant(S.is(schema)(input), `Invalid id for ${config.tableName}: ${input}`, {
        file: "@beep/schema/identity/entity-id/entity-id.ts",
        line: 231,
        args: [input],
      });
      return input;
    };
    static readonly makePrivateId = (input: number) => {
      invariant(S.is(privateSchema)(input), `Invalid private id for ${config.tableName}: ${input}`, {
        file: "@beep/schema/identity/entity-id/entity-id.ts",
        line: 239,
        args: [input],
      });
      return input;
    };
  };
}

export const make = <const TableName extends string, const Brand extends string>(
  tableName: SnakeTag.Literal<TableName>,
  {
    annotations,
    brand,
  }: {
    readonly brand: Brand;
    readonly annotations?: undefined | Omit<DefaultAnnotations<EntityId.Type<TableName>>, "title" | "identifier">;
  }
): EntityId.SchemaInstance<TableName, Brand> => {
  return makeEntityIdSchemaInstance({tableName, brand, annotations});
};
