import { invariant } from "@beep/invariant";
import type { DefaultAnnotations } from "@beep/schema/annotations";
import type * as B from "effect/Brand";
import * as Data from "effect/Data";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { type SnakeTag, UUIDLiteralEncoded } from "./custom";

export type EntityIdSchema<Prefix extends string, Brand extends string> = S.brand<
  S.TemplateLiteral<`${SnakeTag.Literal<Prefix>}__${string}-${string}-${string}-${string}-${string}`>,
  Brand
>;

export type EntityIdFactoryConfig<Brand extends string, TableName extends string> = {
  readonly tableName: TableName;
  readonly brand: Brand;
  readonly annotations: Omit<
    DefaultAnnotations<S.Schema.Type<EntityIdSchema<TableName, Brand>>>,
    "identifier" | "title"
  >;
};

export class EntityIdKit<const Brand extends string, const Prefix extends string> extends Data.TaggedClass(
  "EntityIdKit"
)<EntityIdFactoryConfig<Brand, Prefix>> {
  readonly Schema: EntityIdSchema<Prefix, Brand>;
  readonly make: (id: string) => S.Schema.Type<EntityIdSchema<Prefix, Brand>>;
  readonly create: () => S.Schema.Type<EntityIdSchema<Prefix, Brand>>;
  readonly is: (i: unknown) => i is S.Schema.Type<EntityIdSchema<Prefix, Brand>>;

  constructor(
    params: EntityIdFactoryConfig<Brand, Prefix> & {
      readonly tableName: SnakeTag.Literal<Prefix>;
    }
  ) {
    const makeBranded = <const T extends string>(i: T) => i as B.Branded<T, Brand>;
    const create = () => F.pipe(params.tableName, Str.concat("__"), Str.concat(UUIDLiteralEncoded.make()), makeBranded);
    const Schema = S.TemplateLiteral(S.Literal(params.tableName), "__", UUIDLiteralEncoded)
      .pipe(S.brand(params.brand))
      .annotations({
        ...params.annotations,
        identifier: Str.endsWith("Id")(params.brand) ? params.brand : `${params.brand}Id`,
        title: `${Str.split("_")(params.tableName).map(Str.capitalize).join(" ")} Id`,
        jsonSchema: { type: "string", format: `${params.tableName}__uuid` },
        arbitrary: () => (fc) => fc.constantFrom(null).map(() => create()),
        pretty: () => (i) => `${params.brand}(${i})`,
      });

    super(params);
    this.make = (id: string) => {
      invariant(S.is(Schema)(id), "Not a valid prefixed id", {
        file: "@beep/schema/EntityId.ts",
        line: 52,
        args: [id],
      });
      return id;
    };
    this.create = create;
    this.is = S.is(Schema);
    this.Schema = Schema;
  }
}
