import { LiteralWithDefault } from "@beep/schema/custom";
import { DiscriminatedUnionFactoryBuilder } from "@beep/schema/generics/DiscriminatedUnion.factory";
import type { OptionalWithDefault } from "@beep/schema/types";
import type { StringTypes, StructTypes } from "@beep/types";

export const makeFactory = <const OperatorCategory extends StringTypes.NonEmptyString<string>>(
  category: OperatorCategory
) =>
  new DiscriminatedUnionFactoryBuilder("operator", {
    category: LiteralWithDefault(category),
  });

export const fields = <
  const Symbol extends StringTypes.NonEmptyString<string>,
  const Human extends StringTypes.NonEmptyString<string>,
  const Extra extends StructTypes.StructFieldsWithStringKeys,
>(
  symbol: Symbol,
  human: Human,
  extra?: Extra
) =>
  ({
    symbol: LiteralWithDefault(symbol),
    human: LiteralWithDefault(human),
    ...(extra ? extra : ({} as Extra)),
  }) as {
    readonly symbol: OptionalWithDefault<Symbol>;
    readonly human: OptionalWithDefault<Human>;
  } & {
    readonly [K in keyof Extra]: Extra[K];
  };
