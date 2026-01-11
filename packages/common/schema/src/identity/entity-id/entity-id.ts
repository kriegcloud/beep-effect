import { invariant } from "@beep/invariant";
import type { DefaultAnnotations } from "@beep/schema/core";
import { mergeSchemaAnnotations } from "@beep/schema/core/annotations/built-in-annotations";
import { variance } from "@beep/schema/core/variance";
import { SnakeTag } from "@beep/schema/primitives/string/string";
import { exact } from "@beep/utils/struct";
import * as M from "@effect/sql/Model";
import type { $Type, HasDefault, HasRuntimeDefault, IsPrimaryKey, NotNull } from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import * as A from "effect/Array";
import type * as B from "effect/Brand";
import type * as FC from "effect/FastCheck";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import { TypeId } from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import * as Str from "effect/String";
import { UUIDLiteralEncoded } from "./uuid";

export type AppendType<Template extends string, Next> = Next extends AST.LiteralValue
  ? `${Template}${Next}`
  : Next extends S.Schema<infer A extends AST.LiteralValue, infer _I, infer _R>
    ? `${Template}${A}`
    : never;

export declare namespace EntityId {
  export type Type<TableName extends string> =
    `${AppendType<"", SnakeTag.Literal<TableName>>}__${string}-${string}-${string}-${string}-${string}`;
  export type PublicIdSchema<TableName extends string> = S.TemplateLiteral<Type<TableName>>;

  export type PrivateIdType<Brand extends string> = B.Branded<number, Brand>;
  export type PrivateIdSchema<Brand extends string> = S.brand<S.refine<number, typeof S.NonNegative>, Brand>;

  export type PublicIdColumn<TableName extends string> = HasRuntimeDefault<
    HasDefault<$Type<NotNull<pg.PgTextBuilderInitial<"id", [string, ...string[]]>>, EntityId.Type<TableName>>>
  >;
  export type PrivateIdColumn<Brand extends string> = $Type<
    IsPrimaryKey<NotNull<NotNull<pg.PgSerialBuilderInitial<"_row_id">>>>,
    B.Branded<number, Brand>
  >;
  export type ModelRowIdSchema<Brand extends string> = M.Generated<
    S.brand<S.refine<number, typeof S.NonNegative>, Brand>
  >;
  export type ModelIdSchema<TableName extends string> = S.optionalWith<
    EntityId.PublicIdSchema<TableName>,
    {
      default: () => `${SnakeTag.Literal<TableName>}__${string}-${string}-${string}-${string}-${string}`;
    }
  >;
}

export interface EntityId<TableName extends string, Brand extends string>
  extends S.AnnotableClass<
    EntityId<TableName, Brand>,
    S.Schema.Type<EntityId.PublicIdSchema<TableName>>,
    S.Schema.Type<EntityId.PublicIdSchema<TableName>>
  > {
  readonly [TypeId]: typeof variance;
  readonly create: PublicIdCreate<TableName>;
  readonly tableName: SnakeTag.Literal<TableName>;
  readonly brand: Brand;
  readonly is: (
    u: unknown,
    overrideOptions?: AST.ParseOptions | number
  ) => u is S.Schema.Type<EntityId.PublicIdSchema<TableName>>;
  readonly publicId: () => EntityId.PublicIdColumn<TableName>;
  readonly privateId: () => EntityId.PrivateIdColumn<Brand>;
  readonly privateSchema: EntityId.PrivateIdSchema<Brand>;
  readonly modelRowIdSchema: EntityId.ModelRowIdSchema<Brand>;
  readonly modelIdSchema: EntityId.ModelIdSchema<TableName>;
  readonly make: (
    id: string,
    options?: undefined | AST.ParseOptions
  ) => S.Schema.Type<EntityId.PublicIdSchema<TableName>>;
}

export const makeBaseSchemas = <const TableName extends string, const Brand extends string>(
  tableName: SnakeTag.Literal<TableName>,
  brand: Brand
): {
  readonly publicSchema: EntityId.PublicIdSchema<TableName>;
  readonly privateSchema: EntityId.PrivateIdSchema<Brand>;
} => {
  const publicSchema = S.TemplateLiteral(tableName, "__", UUIDLiteralEncoded);
  const privateSchema = S.NonNegativeInt.pipe(S.brand(brand));

  return {
    publicSchema,
    privateSchema,
  };
};

export type PublicIdCreate<TableName extends string> = () => S.Schema.Type<EntityId.PublicIdSchema<TableName>>;

export const makeAnnotations = <const TableName extends string, const Brand extends string>(
  tableName: SnakeTag.Literal<TableName>,
  brand: Brand,
  create: PublicIdCreate<TableName>
): S.Annotations.Schema<EntityId.Type<TableName>> => {
  const identifier = Str.endsWith("Id")(brand) ? brand : Str.concat("Id")(brand);
  const title = F.pipe(tableName, Str.split("_"), A.map(Str.capitalize), A.join(" "), Str.concat(" Id"));
  const description = `The public unique identifier for the ${tableName}`;
  const jsonSchemaFormat = Str.concat("__${string}-${string}-${string}-${string}-${string}")(tableName);
  const arbitrary = () => (fc: typeof FC) => fc.constantFrom(null).map(() => create());
  const pretty = () => (value: string) => `${brand}(${value})`;

  const jsonSchema = {
    type: "string",
    format: jsonSchemaFormat,
  };

  return {
    identifier,
    title,
    description,
    arbitrary,
    pretty,
    jsonSchema,
  };
};

export type EntityIdColumns<TableName extends string, Brand extends string> = {
  readonly publicId: EntityId.PublicIdColumn<TableName>;
  readonly privateId: EntityId.PrivateIdColumn<Brand>;
};

export const makeColumns = <const TableName extends string, const Brand extends string>(
  create: PublicIdCreate<TableName>,
  _brand: Brand
): EntityIdColumns<TableName, Brand> => {
  const publicId = pg
    .text("id")
    .notNull()
    .unique()
    .$type<EntityId.Type<TableName>>()
    .$defaultFn(() => create());
  const privateId = pg.serial("_row_id").notNull().primaryKey().$type<B.Branded<number, Brand>>();

  return {
    publicId,
    privateId,
  };
};

export const tableNameIsSnakeCase = <const TableName extends string>(tableName: SnakeTag.Literal<TableName>) => {
  invariant(S.is(SnakeTag)(tableName), "TableName must be a lowercase snake case string", {
    file: "@beep/schema/identity/entity-id/entity-id.ts",
    line: 128,
    args: [tableName],
  });
};

export function makeEntityIdSchema<const TableName extends string, const Brand extends string>(
  tableName: SnakeTag.Literal<TableName>,
  brand: Brand,
  annotations?: S.Annotations.Schema<EntityId.Type<TableName>>,
  ast?: AST.AST | undefined
): EntityId<TableName, Brand> {
  tableNameIsSnakeCase(tableName);

  const create = () => `${tableName}__${UUIDLiteralEncoded.create()}` as const;

  const defaultAnnotations = makeAnnotations(tableName, brand, create);

  const identifier = defaultAnnotations.identifier;
  const title = defaultAnnotations.title;
  const description = annotations?.description ?? defaultAnnotations.description;
  const arbitrary = annotations?.arbitrary ?? defaultAnnotations.arbitrary;
  const pretty = annotations?.pretty ?? defaultAnnotations.pretty;
  const jsonSchema = annotations?.jsonSchema ?? defaultAnnotations.jsonSchema;

  const { publicSchema, privateSchema } = makeBaseSchemas(tableName, brand);

  const schemaAST = ast ?? publicSchema.ast;

  const defaultAST = mergeSchemaAnnotations(schemaAST, defaultAnnotations);

  const columns = makeColumns(create, brand);

  class BaseClass extends S.make<S.Schema.Type<EntityId.PublicIdSchema<TableName>>>(defaultAST) {
    static override annotations(annotations: S.Annotations.Schema<S.Schema.Type<EntityId.PublicIdSchema<TableName>>>) {
      const mergedAnnotations = exact({
        identifier: annotations.identifier ?? identifier,
        title: annotations.title ?? title,
        description: annotations.description ?? description,
        arbitrary: annotations.arbitrary ?? arbitrary,
        pretty: annotations.pretty ?? pretty,
        jsonSchema: annotations.jsonSchema ?? jsonSchema,
      });

      return makeEntityIdSchema(
        tableName,
        brand,
        mergedAnnotations,
        mergeSchemaAnnotations(defaultAST, mergedAnnotations)
      );
    }

    override [TypeId] = variance;
    static override [TypeId] = variance;
    static readonly create = create;
    static readonly getSliceName = () => F.pipe(tableName, Str.split("_"), A.head);
    static readonly tableName = tableName;
    static readonly brand = brand;
    static readonly is = S.is(publicSchema);
    static readonly publicId = (): EntityId.PublicIdColumn<TableName> => columns.publicId;
    static readonly privateId = (): EntityId.PrivateIdColumn<Brand> => columns.privateId;
    static readonly privateSchema = privateSchema;
    static readonly make = (id: string, options?: undefined | AST.ParseOptions) =>
      options ? S.decodeUnknownSync(publicSchema, options)(id) : S.decodeUnknownSync(publicSchema)(id);

    static readonly modelIdSchema = S.optionalWith(publicSchema, {
      default: () => create(),
    });
    static readonly modelRowIdSchema = M.Generated(
      privateSchema.annotations({
        description: `The internal primary key for the ${tableName}`,
      })
    );
    static readonly makePrivateId = (input: number): B.Branded<number, Brand> => {
      invariant(S.is(privateSchema)(input), `Invalid private id for ${tableName}: ${input}`, {
        file: "@beep/schema/identity/entity-id/entity-id.ts",
        line: 239,
        args: [input],
      });
      return input;
    };
  }

  return BaseClass;
}

export const make = <const TableName extends string, const Brand extends string>(
  tableName: SnakeTag.Literal<TableName>,
  opts: {
    readonly brand: Brand;
    readonly annotations?: Omit<DefaultAnnotations<EntityId.Type<TableName>>, "title" | "identifier">;
  }
): EntityId<TableName, Brand> => makeEntityIdSchema(tableName, opts.brand, opts.annotations);

export const builder = <const SliceName extends string>(
  sliceName: SnakeTag.Literal<SliceName>
): (<const TableName extends string, const Brand extends string>(
  tableName: SnakeTag.Literal<TableName>,
  opts: {
    readonly brand: Brand;
    readonly annotations?: Omit<DefaultAnnotations<EntityId.Type<TableName>>, "title" | "identifier">;
  }
) => EntityId<`${SliceName}_${TableName}`, Brand>) => {
  return <const TableName extends string, const Brand extends string>(
    tableName: SnakeTag.Literal<TableName>,
    opts: {
      readonly brand: Brand;
      readonly annotations?: Omit<DefaultAnnotations<EntityId.Type<TableName>>, "title" | "identifier">;
    }
  ): EntityId<`${SliceName}_${TableName}`, Brand> => make(`${sliceName}_${tableName}` as const, opts);
};
