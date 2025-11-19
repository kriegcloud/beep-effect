/**
 * Entity id factory that bridges snake_case table names with branded UUID literals.
 *
 * Provides runtime helpers used by IAM/files slices to mint deterministic identifiers, configure Drizzle columns,
 * and annotate schemas with identity-aware metadata.
 *
 * @example
 * import { SnakeTag } from "@beep/schema/primitives/string/string";
 * import * as EntityId from "@beep/schema/identity/entity-id/entity-id";
 *
 * const PeopleId = EntityId.make(SnakeTag.make("people"), {
 *   brand: "PersonId",
 *   annotations: {
 *     description: "Primary key for people records",
 *   },
 * });
 *
 * const value = PeopleId.create();
 *
 * @category Identity/EntityId
 * @since 0.1.0
 */
import { invariant } from "@beep/invariant";
import type { DefaultAnnotations } from "@beep/schema/core/annotations/default";
import { variance } from "@beep/schema/core/variance";
import { SnakeTag } from "@beep/schema/primitives/string/string";
import type { $Type, HasDefault, HasRuntimeDefault, IsPrimaryKey, NotNull } from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import * as A from "effect/Array";
import type * as B from "effect/Brand";
import * as Data from "effect/Data";
import type * as FastCheck from "effect/FastCheck";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import { TypeId } from "effect/Schema";
import * as Str from "effect/String";
import { Id } from "./_id";
import { UUIDLiteralEncoded } from "./uuid";

type Config<Brand extends string, TableName extends string> = {
  readonly tableName: SnakeTag.Literal<TableName>;
  readonly brand: Brand;
};

const makeIdentifier = (brand: string) => (Str.endsWith("Id")(brand) ? brand : Str.concat("Id")(brand));

const makeTitle = <const TableName extends string>(tableName: SnakeTag.Literal<TableName>) =>
  F.pipe(tableName, Str.split("_"), A.map(Str.capitalize), A.join(" "), Str.concat(" Id"));

const makeDescription = <const TableName extends string>(tableName: SnakeTag.Literal<TableName>) =>
  F.pipe(Str.concat(tableName)("Entity identifier for "), Str.concat(" records."));

const makeFormat = <const TableName extends string>(tableName: SnakeTag.Literal<TableName>) =>
  F.pipe(tableName, Str.concat("__uuid"));

const makeCreateFn =
  <const TableName extends string>(tableName: SnakeTag.Literal<TableName>) =>
  () =>
    F.pipe(tableName, Str.concat("__"), Str.concat(UUIDLiteralEncoded.create()));

type Annotations<TableName extends string> = DefaultAnnotations<Type<TableName>>;

/**
 * Template literal schema describing `${tableName}__uuid` identifiers.
 *
 * @example
 * import type { SchemaType } from "@beep/schema/identity/entity-id/entity-id";
 * import { SnakeTag } from "@beep/schema/primitives/string/string";
 *
 * type PeopleIdSchema = SchemaType<SnakeTag.Literal<"people">>;
 *
 * @category Identity/EntityId
 * @since 0.1.0
 */
export type SchemaType<TableName extends string> =
  S.TemplateLiteral<`${SnakeTag.Literal<TableName>}__${string}-${string}-${string}-${string}-${string}`>;

/**
 * Runtime type produced by {@link SchemaType}.
 *
 * @example
 * import { SnakeTag } from "@beep/schema/primitives/string/string";
 * import type { Type } from "@beep/schema/identity/entity-id/entity-id";
 *
 * type PeopleId = Type<SnakeTag.Literal<"people">>;
 *
 * @category Identity/EntityId
 * @since 0.1.0
 */
export type Type<TableName extends string> = S.Schema.Type<SchemaType<TableName>>;

/**
 * Encoded representation accepted by {@link SchemaType}.
 *
 * @example
 * import { SnakeTag } from "@beep/schema/primitives/string/string";
 * import type { Encoded } from "@beep/schema/identity/entity-id/entity-id";
 *
 * type SerializedPeopleId = Encoded<SnakeTag.Literal<"people">>;
 *
 * @category Identity/EntityId
 * @since 0.1.0
 */
export type Encoded<TableName extends string> = S.Schema.Encoded<SchemaType<TableName>>;

/**
 * Entity id schema factory that wires annotations, json schema metadata, and FastCheck samples.
 *
 * @example
 * import { SnakeTag } from "@beep/schema/primitives/string/string";
 * import { Factory } from "@beep/schema/identity/entity-id/entity-id";
 *
 * const factory = new Factory({ tableName: SnakeTag.make("people"), brand: "PersonId" });
 * const schema = factory.Schema({ description: "Primary key" });
 *
 * @category Identity/EntityId
 * @since 0.1.0
 */
export class Factory<const TableName extends string, const Brand extends string> extends Data.TaggedClass("EntityId")<
  Config<Brand, TableName>
> {
  /**
   * Produces a fully annotated template literal schema for the configured table + brand.
   *
   * @category Identity/EntityId
   * @since 0.1.0
   */
  readonly Schema: (annotations: Annotations<TableName>) => SchemaType<TableName>;

  constructor({ tableName, brand }: Config<Brand, TableName>) {
    const create = makeCreateFn(tableName);
    super({ tableName, brand });
    this.Schema = (annotations: Annotations<TableName>) => {
      const identifier = makeIdentifier(brand);
      const title = makeTitle(tableName);
      const description = makeDescription(tableName);
      const jsonSchemaFormat = makeFormat(tableName);

      return S.TemplateLiteral(S.Literal(tableName), "__", UUIDLiteralEncoded)
        .annotations(annotations)
        .annotations(
          Id.annotations("EntityIdSchema", {
            identifier,
            title,
            description,
            jsonSchema: { type: "string", format: jsonSchemaFormat },
            arbitrary: () => (fc: typeof FastCheck) => fc.constantFrom(null).map(() => create()),
            pretty: () => (value: string) => `${brand}(${value})`,
          })
        );
    };
  }
}

/**
 * Drizzle column definition representing the public UUID text column.
 *
 * @example
 * import { SnakeTag } from "@beep/schema/primitives/string/string";
 * import type { PublicId } from "@beep/schema/identity/entity-id/entity-id";
 *
 * type Column = PublicId<SnakeTag.Literal<"people">>;
 *
 * @category Identity/EntityId
 * @since 0.1.0
 */
export type PublicId<TableName extends string> = HasRuntimeDefault<
  HasDefault<
    $Type<
      NotNull<pg.PgTextBuilderInitial<"id", [string, ...string[]]>>,
      `${SnakeTag.Literal<TableName>}__${string}-${string}-${string}-${string}-${string}`
    >
  >
>;

/**
 * Drizzle serial column wired as the private autoincrement id.
 *
 * @example
 * import type { PrivateId } from "@beep/schema/identity/entity-id/entity-id";
 *
 * type RowId = PrivateId<"PersonId">;
 *
 * @category Identity/EntityId
 * @since 0.1.0
 */
export type PrivateId<Brand extends string> = $Type<
  IsPrimaryKey<NotNull<NotNull<pg.PgSerialBuilderInitial<"_row_id">>>>,
  B.Branded<number, Brand>
>;

/**
 * Schema instance returned by {@link make}, including helper metadata + Drizzle builders.
 *
 * @example
 * import { SnakeTag } from "@beep/schema/primitives/string/string";
 * import type { EntityIdSchemaInstance } from "@beep/schema/identity/entity-id/entity-id";
 * import * as EntityId from "@beep/schema/identity/entity-id/entity-id";
 * const PersonIdSchema: EntityIdSchemaInstance<SnakeTag.Literal<"person">, "PersonId"> = EntityId.make("person", {
 *   brand: "PersonId",
 *   annotations: {
 *     schemaId: Symbol.for("@beep/PersonId"),
 *     description: "A unique identifier for a person",
 *   },
 * });
 * const personIdColumn = PersonIdSchema.publicId();
 *
 * @category Identity/EntityId
 * @since 0.1.0
 */
export type EntityIdSchemaInstance<TableName extends string, Brand extends string> = SchemaType<TableName> & {
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
    SchemaType<TableName>,
    {
      exact: true;
      default: () => Type<TableName>;
    }
  >;
  readonly modelRowIdSchema: S.brand<S.refine<number, typeof S.NonNegative>, Brand>;
  readonly make: (input: string) => Type<TableName>;
  readonly makePrivateId: (input: number) => B.Branded<number, Brand>;
};

/**
 * Public factory for creating entity id schemas with Drizzle column helpers.
 *
 * @example
 * import { SnakeTag } from "@beep/schema/primitives/string/string";
 * import { make } from "@beep/schema/identity/entity-id/entity-id";
 *
 * const TagId = make(SnakeTag.make("tags"), {
 *   brand: "TagId",
 *   annotations: { description: "Primary key for tags" },
 * });
 *
 * @category Identity/EntityId
 * @since 0.1.0
 */
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
    file: "@beep/schema/identity/entity-id/entity-id.ts",
    line: 188,
    args: [tableName],
  });
  const factory = new Factory<TableName, Brand>({ tableName, brand });
  const create = makeCreateFn(tableName);

  const privateSchema = S.NonNegativeInt.pipe(S.brand(brand));
  const modelRowIdSchema = privateSchema;

  const schema = factory.Schema({
    ...annotations,
    title: makeTitle(tableName),
    identifier: makeIdentifier(brand),
  });

  const publicId = pg
    .text("id")
    .notNull()
    .unique()
    .$type<typeof schema.Type>()
    .$defaultFn(() => create());

  const privateId = pg.serial("_row_id").notNull().primaryKey().$type<B.Branded<number, Brand>>();

  class WithStatics extends schema {
    override [TypeId] = variance;
    static override [TypeId] = variance;
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
        file: "@beep/schema/identity/entity-id/entity-id.ts",
        line: 231,
        args: [input],
      });
      return input;
    };
    static readonly makePrivateId = (input: number) => {
      invariant(S.is(privateSchema)(input), `Invalid private id for ${tableName}: ${input}`, {
        file: "@beep/schema/identity/entity-id/entity-id.ts",
        line: 239,
        args: [input],
      });
      return input;
    };
  }

  return WithStatics;
};
