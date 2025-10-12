import { invariant } from "@beep/invariant";
import { TaggedUnion } from "@beep/schema/generics";
import type { StringTypes, UnsafeTypes } from "@beep/types";
import type { SnakeTag } from "@beep/types/tag.types";
import { enumFromStringArray } from "@beep/utils";
import { pgEnum } from "drizzle-orm/pg-core";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import type * as Equivalence from "effect/Equivalence";
import * as FC from "effect/FastCheck";
import * as F from "effect/Function";
import * as JSONSchema from "effect/JSONSchema";
import type * as ParseResult from "effect/ParseResult";
import * as Pretty from "effect/Pretty";
import * as Random from "effect/Random";
import * as S from "effect/Schema";

type TaggedMembers<Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>, D extends string> = {
  readonly [I in keyof Literals]: TaggedUnion.Schema<D, Literals[I], {}>;
} & { readonly length: Literals["length"] };

/** Object map: one member per literal key (like Enum, but values are S.Structs) */
type TaggedMembersMap<Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>, D extends string> = {
  readonly [L in Literals[number]]: TaggedUnion.Schema<D, L, {}>;
};

type TaggedUnion<Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>, D extends string> = S.Union<
  TaggedMembers<Literals, D>
>;
type ValidateEnumMapping<
  Literals extends readonly string[],
  Mapping extends readonly [string, string][],
> = Mapping extends readonly [...infer Rest extends readonly [string, string][], readonly [infer Key, infer Value]]
  ? Key extends Literals[number]
    ? Rest extends readonly []
      ? true
      : Value extends Rest[number][1]
        ? false // Duplicate value found
        : ValidateEnumMapping<Literals, Rest>
    : false // Key not in literals
  : false;

// Type to check if all literals are covered
type AllLiteralsCovered<
  Literals extends readonly string[],
  Mapping extends readonly [string, string][],
> = Literals[number] extends Mapping[number][0] ? true : false;

// Type to extract the mapped values from the tuples
type ExtractMappedValues<T extends readonly [string, string][]> = T[number][1];

// Type to create the enum object type
type CreateEnumType<
  Literals extends readonly string[],
  Mapping extends readonly [string, string][] | undefined,
> = Mapping extends readonly [string, string][]
  ? {
      readonly [K in ExtractMappedValues<Mapping>]: Extract<Mapping[number], readonly [UnsafeTypes.UnsafeAny, K]>[0];
    }
  : { readonly [K in Literals[number]]: K };

// Helper type to ensure mapping is exhaustive and unique
export type ValidMapping<
  Literals extends readonly string[],
  Mapping extends readonly [string, string][],
> = ValidateEnumMapping<Literals, Mapping> extends true
  ? AllLiteralsCovered<Literals, Mapping> extends true
    ? Mapping
    : never
  : never;
export type RandomSelection<Options extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>> =
  () => Options[number];

export const randomSelection = <Literal extends StringTypes.NonEmptyString>(
  options: A.NonEmptyReadonlyArray<Literal>
): Literal =>
  F.pipe(
    Random.nextIntBetween(0, A.length(options)),
    Effect.flatMap((idx) => A.get(idx)(options)),
    Effect.catchTag("NoSuchElementException", () => Effect.dieMessage("randomSelection: options are empty")),
    Effect.runSync
  );

/**
 * @since 0.1.0
 * @param literals
 * @category factories
 * @description
 * Create schema & utility functions for string literals
 * @example
 * ```
 * const { Schema, Mock, Enum, Options, Equivalence, JSONSchema } = stringLiteralKit(
 *   "A",
 *   "B",
 *   "C",
 * )({
 *   identifier: "CycleCountClass",
 *   title: "Cycle Count Class",
 *   description: "The type of the order",
 * });
 * ```
 */
/**
 * @since 0.1.0
 * @param literals
 * @category factories
 * @description
 * Create schema & utility functions for string literals
 * @example
 * ```
 * const { Schema, Mock, Enum, Options, Equivalence, JSONSchema } = stringLiteralKit(
 *   "A",
 *   "B",
 *   "C",
 * )({
 *   identifier: "CycleCountClass",
 *   title: "Cycle Count Class",
 *   description: "The type of the order",
 * });
 * ```
 */
export function stringLiteralKit<const Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>>(
  ...literals: Literals[number] extends StringTypes.NonEmptyString<Literals[number]> ? Literals : never
): {
  Schema: S.Literal<[...Literals]>;
  Options: Literals;
  Enum: CreateEnumType<Literals, undefined>;
  Mock: (qty: number) => [...Literals][number][];
  JSONSchema: JSONSchema.JsonSchema7Root;
  Pretty: (a: [...Literals][number]) => string;
  Equivalence: Equivalence.Equivalence<Literals[number]>;
  pick: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => A.NonEmptyReadonlyArray<Keys[number]>;
  omit: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => A.NonEmptyReadonlyArray<Exclude<Literals[number], Keys[number]>>;
  derive: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => {
    Schema: S.Literal<[...Keys]>;
    Options: Keys;
    Enum: CreateEnumType<Keys, undefined>;
    Mock: (qty: number) => [...Literals][number][];
    is: (a: unknown) => a is Keys[number];
    getRandom: RandomSelection<Keys>;
    toTagged: <D extends string>(
      discriminator: StringTypes.NonEmptyString<D>
    ) => {
      readonly Union: TaggedUnion<Keys, D>;
      readonly Members: TaggedMembersMap<Keys, D>;
    };
  };
  getRandom: RandomSelection<Literals>;
  is: (a: unknown) => a is Literals[number];
  assert: (a: unknown) => asserts a is Literals[number];
  decode: (a: string) => Effect.Effect<Literals[number], ParseResult.ParseError, never>;
  toPgEnum: <Name extends string>(name: `${SnakeTag<Name>}`) => ReturnType<typeof pgEnum<Literals[number], Literals>>;
  toTagged: <D extends string>(
    discriminator: StringTypes.NonEmptyString<D>
  ) => {
    readonly Union: TaggedUnion<Literals, D>;
    readonly Members: TaggedMembersMap<Literals, D>;
  };
};

export function stringLiteralKit<
  const Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
  const Mapping extends readonly [Literals[number], string][],
>(
  ...args: Literals[number] extends StringTypes.NonEmptyString<Literals[number]>
    ? [...literals: Literals, options: { enumMapping: ValidMapping<Literals, Mapping> }]
    : never
): {
  Schema: S.Literal<[...Literals]>;
  Options: Literals;
  Enum: CreateEnumType<Literals, Mapping>;
  Mock: (qty: number) => [...Literals][number][];
  JSONSchema: JSONSchema.JsonSchema7Root;
  Pretty: (a: [...Literals][number]) => string;
  Equivalence: Equivalence.Equivalence<Literals[number]>;
  pick: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => A.NonEmptyReadonlyArray<Keys[number]>;
  omit: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => A.NonEmptyReadonlyArray<Exclude<Literals[number], Keys[number]>>;
  derive: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => {
    Schema: S.Literal<[...Keys]>;
    Options: Keys;
    Enum: CreateEnumType<Keys, undefined>;
    Mock: (qty: number) => [...Literals][number][];
    getRandom: RandomSelection<Keys>;
    is: (a: unknown) => a is Keys[number];
    toTagged: <D extends string>(
      discriminator: StringTypes.NonEmptyString<D>
    ) => {
      readonly Union: TaggedUnion<Keys, D>;
      readonly Members: TaggedMembersMap<Keys, D>;
    };
  };
  getRandom: RandomSelection<Literals>;
  is: (a: unknown) => a is Literals[number];
  assert: (a: unknown) => asserts a is Literals[number];
  decode: (a: string) => Effect.Effect<Literals[number], ParseResult.ParseError, never>;
  toPgEnum: <Name extends string>(
    name: `${SnakeTag<Name>}_enum`
  ) => ReturnType<typeof pgEnum<Literals[number], Literals>>;
  toTagged: <D extends string>(
    discriminator: StringTypes.NonEmptyString<D>
  ) => {
    readonly Union: TaggedUnion<Literals, D>;
    readonly Members: TaggedMembersMap<Literals, D>;
  };
};

export function stringLiteralKit<
  const Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
  const Mapping extends readonly [Literals[number], string][],
>(
  ...args: Literals[number] extends StringTypes.NonEmptyString<Literals[number]>
    ? Literals | [...Literals, { enumMapping?: Mapping }]
    : never
): {
  Schema: S.Literal<[...Literals]>;
  Options: Literals;
  Enum: CreateEnumType<Literals, Mapping | undefined>;
  Mock: (qty: number) => [...Literals][number][];
  JSONSchema: JSONSchema.JsonSchema7Root;
  Pretty: (a: [...Literals][number]) => string;
  Equivalence: Equivalence.Equivalence<Literals[number]>;
  pick: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => A.NonEmptyReadonlyArray<Keys[number]>;
  omit: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => A.NonEmptyReadonlyArray<Exclude<Literals[number], Keys[number]>>;
  derive: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => {
    Schema: S.Literal<[...Keys]>;
    Options: Keys;
    Enum: CreateEnumType<Keys, undefined>;
    Mock: (qty: number) => [...Literals][number][];
    is: (a: unknown) => a is Keys[number];
    getRandom: RandomSelection<Keys>;
    toTagged: <D extends string>(
      discriminator: StringTypes.NonEmptyString<D>
    ) => {
      readonly Union: TaggedUnion<Keys, D>;
      readonly Members: TaggedMembersMap<Keys, D>;
    };
  };
  getRandom: RandomSelection<Literals>;
  is: (a: unknown) => a is Literals[number];
  assert: (a: unknown) => asserts a is Literals[number];
  decode: (a: string) => Effect.Effect<Literals[number], ParseResult.ParseError, never>;
  toPgEnum: <Name extends string>(
    name: `${SnakeTag<Name>}_enum`
  ) => ReturnType<typeof pgEnum<Literals[number], Literals>>;
  toTagged: <D extends string>(
    discriminator: StringTypes.NonEmptyString<D>
  ) => {
    readonly Union: TaggedUnion<Literals, D>;
    readonly Members: TaggedMembersMap<Literals, D>;
  };
} {
  // Determine if last argument is options
  const hasOptions =
    args.length > 0 &&
    typeof args[args.length - 1] === "object" &&
    !Array.isArray(args[args.length - 1]) &&
    args[args.length - 1] !== null;

  const literals = (hasOptions ? args.slice(0, -1) : args) as Literals;
  const options = hasOptions ? (args[args.length - 1] as { enumMapping?: Mapping }) : undefined;

  /** Build a Schema.Union of S.Structs tagged by the given discriminator */
  // Build a Schema.Union and a keyed members map for the given discriminator
  const toTagged = <D extends string>(discriminator: StringTypes.NonEmptyString<D>) => {
    // Tuple of S.Struct members (preserves literal order at the type level)
    const memberTuple = literals.map((lit) => TaggedUnion(discriminator)(lit, {})) as unknown as TaggedMembers<
      Literals,
      D
    >;

    // Keyed object map: { [literal]: S.Struct(...) }
    const membersObj = Object.create(null) as Record<string, S.Struct<UnsafeTypes.UnsafeAny>>;
    literals.forEach((lit, i) => {
      membersObj[lit] = (memberTuple as unknown as ReadonlyArray<S.Struct<UnsafeTypes.UnsafeAny>>)[i]!;
    });
    Object.freeze(membersObj);

    // The union schema constructed from the tuple of members
    const Union = S.Union(
      ...(memberTuple as unknown as [
        S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>,
        ...S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>[],
      ])
    ) as TaggedUnion<Literals, D>;

    return {
      Union,
      Members: membersObj as TaggedMembersMap<Literals, D>,
    } as const;
  };

  // Create the enum object
  let Enum: UnsafeTypes.UnsafeAny;

  if (options?.enumMapping) {
    // Validate at runtime
    const mappingMap = new Map(options.enumMapping);
    const setValues = A.map(options.enumMapping, ([_, v]) => v);
    invariant(A.isNonEmptyReadonlyArray(setValues), "enumMapping must have unique values", {
      file: "packages/common/utils/src/factories/stringLiteralKit.ts",
      line: 226,
      args: [setValues],
    });
    const mappedValues = new Set(setValues);

    // Check all literals are mapped
    for (const literal of literals) {
      if (!mappingMap.has(literal)) {
        throw new Error(`Missing mapping for literal: ${literal}`);
      }
    }

    // Check no duplicate values
    if (mappedValues.size !== options.enumMapping.length) {
      throw new Error("Duplicate values in enumMapping");
    }

    // Create enum with mapped keys
    Enum = {} as UnsafeTypes.UnsafeAny;
    for (const [literal, mappedKey] of options.enumMapping) {
      Enum[mappedKey] = literal;
    }
    Object.freeze(Enum);
  } else {
    // Use the enumFromStringArray utility
    Enum = enumFromStringArray(...literals);
  }

  const pick = <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ): A.NonEmptyReadonlyArray<Keys[number]> => {
    const pickedLiterals = literals.filter((lit) => keys.includes(lit)) as unknown as A.NonEmptyReadonlyArray<
      Keys[number]
    >;

    if (pickedLiterals.length === 0) {
      // todo use `effect/Data/TaggedError`
      throw new Error("pick operation must result in at least one literal");
    }

    return pickedLiterals;
  };

  const omit = <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ): A.NonEmptyReadonlyArray<Exclude<Literals[number], Keys[number]>> => {
    const omittedLiterals = literals.filter((lit) => !keys.includes(lit)) as unknown as A.NonEmptyReadonlyArray<
      Exclude<Literals[number], Keys[number]>
    >;

    if (omittedLiterals.length === 0) {
      throw new Error("omit operation must result in at least one literal");
    }

    return omittedLiterals;
  };
  const Schema = S.Literal(...literals).annotations({
    arbitrary: () => (fc) => fc.constantFrom(...literals),
  });
  return {
    Schema: Schema,
    Options: literals,
    Enum,
    Mock: (qty: number) => FC.sample(Arbitrary.make(Schema), qty),
    JSONSchema: JSONSchema.make(Schema),
    Pretty: Pretty.make(Schema),
    Equivalence: S.equivalence(Schema),
    is: S.is(Schema),
    assert: S.asserts(Schema),
    decode: S.decode(Schema),
    pick,
    omit,
    toPgEnum: (name) => pgEnum(name, literals),
    derive: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(...keys: Keys) => {
      const Schema = S.Literal(...keys).annotations({
        arbitrary: () => (fc) => fc.constantFrom(...keys),
      });

      const toTagged = <D extends string>(discriminator: StringTypes.NonEmptyString<D>) => {
        const memberTuple = keys.map((lit) => {
          return TaggedUnion(discriminator)(lit, {});
          // todo: remove this cast
        }) as unknown as TaggedMembers<Keys, D>;

        const membersObj = Object.create(null) as Record<string, S.Struct<UnsafeTypes.UnsafeAny>>;
        keys.forEach((lit, i) => {
          membersObj[lit] = (memberTuple as unknown as ReadonlyArray<S.Struct<UnsafeTypes.UnsafeAny>>)[i]!;
        });
        Object.freeze(membersObj);

        const Union = S.Union(
          // todo: remove this cast
          ...(memberTuple as unknown as [
            S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>,
            ...S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>[],
          ])
        ) as TaggedUnion<Keys, D>;

        return {
          Union,
          Members: membersObj as TaggedMembersMap<Keys, D>,
        } as const;
      };

      return {
        Schema: S.Literal(...keys).annotations({
          arbitrary: () => (fc) => fc.constantFrom(...literals),
        }),
        Options: keys,
        Enum: enumFromStringArray(...keys),
        Mock: (qty: number) => FC.sample(Arbitrary.make(Schema), qty),
        is: S.is(Schema),
        toTagged,
        getRandom: () => randomSelection(keys),
      };
    },
    getRandom: () => randomSelection(literals),
    toTagged,
  } as const;
}
