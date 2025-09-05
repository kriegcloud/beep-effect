import { BS } from "@beep/schema";
import { DiscriminatedUnionFactoryBuilder } from "@beep/schema/generics/DiscriminatedUnion.factory";
import type { StringTypes, StructTypes } from "@beep/types";
import * as Data from "effect/Data";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { SnakeCase } from "type-fest";
// import {FieldType} from "./FieldType";
// import {ValueType} from "./ValueType";
// import type * as A from "effect/Array";

export namespace OperatorType {
  export type TypeConfig = {
    readonly operator: StringTypes.NonEmptyString<SnakeCase<string>>;
    readonly symbol: StringTypes.NonEmptyString<string>;
    readonly label: StringTypes.NonEmptyString<string>;
    readonly description: StringTypes.NonEmptyString<string>;
    // readonly requiresValue: boolean,
    // readonly isNegatable: boolean,
    // readonly category: StringTypes.NonEmptyString<SnakeCase<string>>,
  };

  export type Metadata<Config extends TypeConfig = TypeConfig> = {
    readonly _: {
      [K in keyof Config]: Config[K];
    };
  };

  export class InstanceFactory<const Config extends TypeConfig> extends Data.TaggedClass("OperatorTypeFactory")<
    Metadata<Config>
  > {
    readonly LiteralSchema: S.Literal<[Config["operator"]]>;
    readonly SymbolSchema: S.Literal<[Config["symbol"]]>;

    constructor(params: Metadata<Config>["_"]) {
      super({
        _: params,
      });
      const operatorSplit = Str.split("_")(params.operator).map(Str.capitalize);
      const operatorId = operatorSplit.join("");
      const operatorTitle = operatorSplit.join(" ");

      this.LiteralSchema = S.Literal(params.operator).annotations({
        schemaId: Symbol.for(`@beep/rules/operators/${operatorId}`),
        identifier: operatorId,
        title: operatorTitle,
        description: params.label,
      });
      this.SymbolSchema = S.Literal(params.symbol).annotations({
        schemaId: Symbol.for(`@beep/rules/operators/${operatorId}Symbol`),
        identifier: `${operatorId}Symbol`,
        title: `${operatorTitle} Symbol`,
        description: params.label,
      });
    }
  }

  export const make = <const Config extends TypeConfig>(config: Config) =>
    new OperatorType.InstanceFactory<Config>(config);

  export const makeCategory = <
    const OperatorCategory extends StringTypes.NonEmptyString<string>,
    const CommonFields extends StructTypes.StructFieldsWithStringKeys,
  >(
    category: OperatorCategory,
    commonFields: CommonFields
  ) =>
    new DiscriminatedUnionFactoryBuilder("operator", {
      ...commonFields,
      category: BS.LiteralWithDefault(category),
    });
}
