/**
 * Tuple/enum mapping utilities that bubble up as `Utils.TupleUtils`, allowing
 * docs to showcase how literal unions become frozen runtime enums.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const tupleUtilsFactory = Utils.TupleUtils.makeMappedEnum("pending", "active");
 * const tupleUtilsEnum = tupleUtilsFactory(["pending", "PENDING"] as const, ["active", "ACTIVE"] as const);
 * const tupleUtilsExample: FooTypes.Prettify<typeof tupleUtilsEnum.Enum> = tupleUtilsEnum.Enum;
 * void tupleUtilsExample;
 *
 * @category Documentation
 * @since 0.1.0
 */
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

/**
 * Type guard ensuring a tuple of `[literal, mappedKey]` pairs is valid for the
 * provided literals (all literals covered, no duplicate mapped keys).
 *
 * @example
 * import type { ValidMapping } from "@beep/utils/data/tuple.utils";
 *
 * type Mapping = ValidMapping<["A", "B"], [["A", "one"], ["B", "two"]]>;
 *
 * @category Data
 * @since 0.1.0
 */
export type ValidMapping<
  Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
  Mapping extends A.NonEmptyReadonlyArray<readonly [StringTypes.NonEmptyString, StringTypes.NonEmptyString]>,
> =
  ValidateEnumMapping<Literals, Mapping> extends true
    ? AllLiteralsCovered<Literals, Mapping> extends true
      ? Mapping
      : never
    : never;
/**
 * Extracts the mapped key portion from the tuple entries produced by
 * `makeMappedEnum`.
 *
 * @example
 * import type { ExtractMappedValues } from "@beep/utils/data/tuple.utils";
 *
 * type Keys = ExtractMappedValues<[["A", "one"]]>;
 *
 * @category Data
 * @since 0.1.0
 */
export type ExtractMappedValues<
  T extends A.NonEmptyReadonlyArray<readonly [StringTypes.NonEmptyString, StringTypes.NonEmptyString]>,
> = T[number][1];
/**
 * Shapes the resulting `Enum` object type returned by `makeMappedEnum`, either
 * keyed by mapped names or by the literal strings themselves.
 *
 * @example
 * import type { CreateEnumType } from "@beep/utils/data/tuple.utils";
 *
 * type Enum = CreateEnumType<["A"], [["A", "alpha"]]>;
 *
 * @category Data
 * @since 0.1.0
 */
export type CreateEnumType<
  Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
  Mapping extends A.NonEmptyReadonlyArray<readonly [Literals[number], StringTypes.NonEmptyString]> | undefined,
> =
  Mapping extends A.NonEmptyReadonlyArray<readonly [StringTypes.NonEmptyString, StringTypes.NonEmptyString]>
    ? {
        readonly [K in ExtractMappedValues<Mapping>]: Extract<Mapping[number], readonly [UnsafeTypes.UnsafeAny, K]>[0];
      }
    : { readonly [K in Literals[number]]: K };

/**
 * Builds a frozen mapped enum object plus the original literal options. The
 * helper enforces that every literal is mapped once and no mapped keys collide.
 *
 * @example
 * import { TupleUtils } from "@beep/utils";
 *
 * const status = TupleUtils.makeMappedEnum("pending", "active")(
 *   ["pending", "PENDING"] as const,
 *   ["active", "ACTIVE"] as const
 * );
 * status.Enum.ACTIVE; // "active"
 *
 * @category Data
 * @since 0.1.0
 */
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

/**
 * Convenience type alias for the `makeMappedEnum` factory.
 *
 * @example
 * import type { MakeMappedEnum } from "@beep/utils/data/tuple.utils";
 * import { TupleUtils } from "@beep/utils";
 *
 * const factory: MakeMappedEnum = TupleUtils.makeMappedEnum;
 *
 * @category Data
 * @since 0.1.0
 */
export type MakeMappedEnum = typeof makeMappedEnum;
