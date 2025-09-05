import { BS } from "@beep/schema";
import { DiscriminatedUnionFactoryBuilder } from "@beep/schema/generics/DiscriminatedUnion.factory";
import type { StringTypes, StructTypes, UnsafeTypes } from "@beep/types";
import * as Data from "effect/Data";
import type * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type * as Types from "effect/Types";
import type { SnakeCase } from "type-fest";

export namespace OperatorType {
  export type TypeConfig = {
    readonly operator: StringTypes.NonEmptyString<SnakeCase<string>>;
    readonly symbol: StringTypes.NonEmptyString<string>;
    readonly label: StringTypes.NonEmptyString<string>;
    readonly description: StringTypes.NonEmptyString<string>;
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

type OperatorLiteral = StringTypes.NonEmptyString<string>;

interface OperatorBuilderBaseConfig<TOperator extends OperatorLiteral> {
  readonly operator: TOperator;
  readonly meta: unknown;
}

export type MakeOperatorConfig<
  T extends OperatorBuilderBaseConfig<OperatorLiteral>,
  TMeta = T extends { $type: infer U } ? U : T["meta"],
> = {
  readonly operator: T["operator"];
  readonly meta: TMeta;
} & {};

type TypeConfigPropKey = string | symbol;

export type OperatorBuilderTypeConfig<
  T extends OperatorBuilderBaseConfig<OperatorLiteral>,
  TTypeConfig extends R.ReadonlyRecord<TypeConfigPropKey, UnsafeTypes.UnsafeAny> = R.ReadonlyRecord<
    TypeConfigPropKey,
    UnsafeTypes.UnsafeAny
  >,
> = Types.Simplify<
  {
    readonly operator: T["operator"];
    readonly meta: T["meta"];
  } & TTypeConfig
>;

// interface OperatorTypeBuilder<Fields extends StructTypes.StructFieldsWithStringKeys> {
//   readonly fields: Fields;
// }

export interface OperatorBuilderBase<
  T extends OperatorBuilderBaseConfig<OperatorLiteral> = OperatorBuilderBaseConfig<OperatorLiteral>,
  TTypeConfig extends R.ReadonlyRecord<TypeConfigPropKey, UnsafeTypes.UnsafeAny> = R.ReadonlyRecord<
    TypeConfigPropKey,
    UnsafeTypes.UnsafeAny
  >,
> {
  _: OperatorBuilderTypeConfig<T, TTypeConfig>;
}

export type $Type<T extends OperatorBuilderBase, TType> = T & {
  _: {
    $type: TType;
  };
};

export type RequiresValue<T extends OperatorBuilderBase> = T & {
  _: {
    requiresValue: true;
  };
};

export type IsNegatable<T extends OperatorBuilderBase> = T & {
  _: {
    isNegatable: true;
  };
};

export abstract class OperatorBuilderBase<
  T extends OperatorBuilderBaseConfig<OperatorLiteral> = OperatorBuilderBaseConfig<OperatorLiteral>,
  TTypeConfig extends R.ReadonlyRecord<TypeConfigPropKey, UnsafeTypes.UnsafeAny> = R.ReadonlyRecord<
    TypeConfigPropKey,
    UnsafeTypes.UnsafeAny
  >,
> implements OperatorBuilderBase<T, TTypeConfig> {}
