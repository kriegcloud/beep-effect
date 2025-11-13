import type { StringTypes, UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as F from "effect/Function";

type EnumEntry = readonly [StringTypes.NonEmptyString, StringTypes.NonEmptyString];
type ValidateEnumMapping<
  Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
  Mapping extends ReadonlyArray<EnumEntry>,
> = Mapping extends readonly [infer Head extends EnumEntry, ...infer Rest extends ReadonlyArray<EnumEntry>]
  ? Head[0] extends Literals[number]
    ? Head[1] extends Rest[number][1]
      ? false
      : ValidateEnumMapping<Literals, Rest>
    : false
  : true;

type AllLiteralsCovered<
  Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
  Mapping extends A.NonEmptyReadonlyArray<readonly [StringTypes.NonEmptyString, StringTypes.NonEmptyString]>,
> = Literals[number] extends Mapping[number][0] ? true : false;

export type ValidMapping<
  Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
  Mapping extends A.NonEmptyReadonlyArray<readonly [StringTypes.NonEmptyString, StringTypes.NonEmptyString]>,
> = ValidateEnumMapping<Literals, Mapping> extends true
  ? AllLiteralsCovered<Literals, Mapping> extends true
    ? Mapping
    : never
  : never;
export type ExtractMappedValues<
  T extends A.NonEmptyReadonlyArray<readonly [StringTypes.NonEmptyString, StringTypes.NonEmptyString]>,
> = T[number][1];
export type CreateEnumType<
  Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
  Mapping extends A.NonEmptyReadonlyArray<readonly [Literals[number], StringTypes.NonEmptyString]> | undefined,
> = Mapping extends A.NonEmptyReadonlyArray<readonly [StringTypes.NonEmptyString, StringTypes.NonEmptyString]>
  ? {
      readonly [K in ExtractMappedValues<Mapping>]: Extract<Mapping[number], readonly [UnsafeTypes.UnsafeAny, K]>[0];
    }
  : { readonly [K in Literals[number]]: K };

export const makeMappedEnum =
  <const Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>>(...literals: Literals) =>
  <const Mapping extends A.NonEmptyReadonlyArray<readonly [Literals[number], StringTypes.NonEmptyString]>>(
    ...mapping: Mapping
  ): ValidMapping<Literals, Mapping> extends never
    ? never
    : {
        readonly Enum: CreateEnumType<Literals, ValidMapping<Literals, Mapping>>;
        readonly Options: Literals;
      } => {
    const Enum = F.pipe(
      mapping,
      A.reduce({} as UnsafeTypes.UnsafeAny, (acc, [literal, mappedKey]) => {
        acc[mappedKey] = literal;

        return acc;
      })
    );
    Object.freeze(Enum);

    return {
      Enum,
      Options: literals,
    } as ValidMapping<Literals, Mapping> extends never
      ? never
      : {
          readonly Enum: CreateEnumType<Literals, ValidMapping<Literals, Mapping>>;
          readonly Options: Literals;
        };
  };

export type MakeMappedEnum = typeof makeMappedEnum;
