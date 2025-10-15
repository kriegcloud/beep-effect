import { invariant } from "@beep/invariant";
import type { DefaultAnnotations } from "@beep/schema/annotations";
import { SnakeTag, UUIDLiteralEncoded } from "@beep/schema/custom";
import { variance } from "@beep/schema/variance";
import * as M from "@effect/sql/Model";
import type { $Type, HasDefault, HasRuntimeDefault, IsPrimaryKey, NotNull } from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import type * as B from "effect/Brand";
import * as Data from "effect/Data";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import { TypeId } from "effect/Schema";
import * as Str from "effect/String";

type Config<Brand extends string, TableName extends string> = {
  readonly tableName: SnakeTag.Literal<TableName>;
  readonly brand: Brand;
};

export type SchemaType<TableName extends string> =
  S.TemplateLiteral<`${SnakeTag.Literal<TableName>}__${string}-${string}-${string}-${string}-${string}`>;

export type Type<TableName extends string> = S.Schema.Type<SchemaType<TableName>>;
export type Encoded<TableName extends string> = S.Schema.Encoded<SchemaType<TableName>>;

type Annotations<TableName extends string, Brand extends string> = DefaultAnnotations<Type<TableName>>;

export class Factory<const TableName extends string, const Brand extends string> extends Data.TaggedClass("EntityId")<
  Config<Brand, TableName>
> {
  readonly Schema: (annotations: Annotations<TableName, Brand>) => SchemaType<TableName>;

  constructor(
    readonly tableName: SnakeTag.Literal<TableName>,
    readonly brand: Brand
  ) {
    const create = () => F.pipe(tableName, Str.concat("__"), Str.concat(UUIDLiteralEncoded.create()));
    super({ tableName, brand });
    this.Schema = (annotations: Annotations<TableName, Brand>) =>
      S.TemplateLiteral(S.Literal(tableName), "__", UUIDLiteralEncoded).annotations({
        ...annotations,
        identifier: Str.endsWith("Id")(brand) ? brand : `${brand}Id`,
        title: `${Str.split("_")(tableName).map(Str.capitalize).join(" ")} Id`,
        jsonSchema: { type: "string", format: `${tableName}__uuid` },
        arbitrary: () => (fc) => fc.constantFrom(null).map(() => create()),
        pretty: () => (i) => `${brand}(${i})`,
      });
  }
}

export type PublicId<TableName extends string, Brand extends string> = HasRuntimeDefault<
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

export type EntityIdSchemaInstance<TableName extends string, Brand extends string> = SchemaType<TableName> & {
  readonly [TypeId]: typeof variance;
  readonly create: () => Type<TableName>;
  readonly tableName: SnakeTag.Literal<TableName>;
  readonly brand: Brand;
  readonly is: (u: unknown) => u is Type<TableName>;
  readonly publicId: () => PublicId<TableName, Brand>;
  readonly privateId: () => PrivateId<Brand>;
  readonly privateIdColumnNameSql: "_row_id";
  readonly privateIdColumnName: "_rowId";
  readonly publicIdColumnNameSql: "id";
  readonly publicIdColumnName: "id";
  readonly privateSchema: S.brand<S.refine<number, typeof S.NonNegative>, Brand>;
  readonly modelIdSchema: S.optionalWith<
    SchemaType<TableName>,
    {
      exact: true;
      default: () => Type<TableName>;
    }
  >;
  readonly modelRowIdSchema: M.Generated<S.brand<S.refine<number, typeof S.NonNegative>, Brand>>;
  readonly make: (input: string) => Type<TableName>;
};

export const make = <const TableName extends string, const Brand extends string>(
  tableName: SnakeTag.Literal<TableName>,
  {
    annotations,
    brand,
  }: {
    readonly brand: Brand;
    readonly annotations: Omit<DefaultAnnotations<Type<TableName>>, "title" | "identifier">;
  }
): EntityIdSchemaInstance<TableName, Brand> => {
  invariant(S.is(SnakeTag)(tableName), "TableName must be a lowercase snake case string", {
    file: "./packages/common/schema/EntityId.ts",
    line: 91,
    args: [tableName],
  });
  const factory = new Factory<TableName, Brand>(tableName, brand);

  const privateSchema = S.NonNegativeInt.pipe(S.brand(brand));
  const modelRowIdSchema = M.Generated(privateSchema);

  const schema = factory.Schema({
    ...annotations,
    identifier: Str.endsWith("Id")(brand) ? brand : `${brand}Id`,
    title: `${Str.split("_")(tableName).map(Str.capitalize).join(" ")} Id`,
    jsonSchema: { type: "string", format: `${tableName}__"\`\${uuid}\`"` },
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => create()),
    pretty: () => (i) => `${brand}(${i})`,
  });

  const create = () => Str.concat(UUIDLiteralEncoded.create())(Str.concat("__")(tableName));

  const publicId = pg
    .text("id")
    .notNull()
    .unique()
    .$type<typeof schema.Type>()
    .$defaultFn(() => create());

  const privateId = pg.serial("_row_id").notNull().primaryKey().$type<B.Branded<number, Brand>>();

  class WithStatics extends schema {
    [TypeId] = variance;
    static [TypeId] = variance;
    static readonly create = create;
    static readonly tableName = tableName;
    static readonly brand = brand;
    static readonly is = S.is(schema);
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
      invariant(S.is(schema)(input), `Invalid id for ${tableName}: ${input}`, {
        file: "./packages/common/schema/EntityId.ts",
        line: 134,
        args: [input],
      });
      return input;
    };
  }

  // hide the fact it extends SchemaClass
  return WithStatics;
};
