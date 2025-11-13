import { TaggedUnion } from "@beep/schema/generics";
import type { StringTypes, UnsafeTypes } from "@beep/types";
import { enumFromStringArray } from "@beep/utils";
import type { CreateEnumType, ValidMapping } from "@beep/utils/data/tuple.utils";
import { makeMappedEnum } from "@beep/utils/data/tuple.utils";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as S from "effect/Schema";

type TaggedMembers<Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>, D extends string> = {
  readonly [I in keyof Literals]: TaggedUnion.Schema<D, Literals[I], {}>;
} & { readonly length: Literals["length"] };

/** Object map: one member per literal key (like Enum, but values are S.Structs) */
type TaggedMembersMap<Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>, D extends string> = {
  readonly [L in Literals[number]]: TaggedUnion.Schema<D, L, {}>;
};

type TaggedUnion<
  Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
  D extends StringTypes.NonEmptyString,
> = S.Union<TaggedMembers<Literals, D>>;

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
  readonly Schema: S.Literal<[...Literals]>;
  readonly Options: Literals;
  readonly Enum: CreateEnumType<Literals, undefined>;
  readonly derive: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => {
    readonly Schema: S.Literal<[...Keys]>;
    readonly Options: Keys;
    readonly Enum: CreateEnumType<Keys, undefined>;
    readonly toTagged: <D extends StringTypes.NonEmptyString>(
      discriminator: StringTypes.NonEmptyString<D>
    ) => {
      readonly Union: TaggedUnion<Keys, D>;
      readonly Members: TaggedMembersMap<Keys, D>;
    };
  };
  readonly toTagged: <D extends StringTypes.NonEmptyString>(
    discriminator: StringTypes.NonEmptyString<D>
  ) => {
    readonly Union: TaggedUnion<Literals, D>;
    readonly Members: TaggedMembersMap<Literals, D>;
  };
};

export function stringLiteralKit<
  const Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
  const Mapping extends A.NonEmptyReadonlyArray<[Literals[number], StringTypes.NonEmptyString]>,
>(
  ...args: Literals[number] extends StringTypes.NonEmptyString<Literals[number]>
    ? [...literals: Literals, options: { readonly enumMapping: ValidMapping<Literals, Mapping> }]
    : never
): {
  readonly Schema: S.Literal<[...Literals]>;
  readonly Options: Literals;
  readonly Enum: CreateEnumType<Literals, ValidMapping<Literals, Mapping>>;
  readonly derive: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => {
    readonly Schema: S.Literal<[...Keys]>;
    readonly Options: Keys;
    readonly Enum: CreateEnumType<Keys, undefined>;
    readonly toTagged: <D extends StringTypes.NonEmptyString>(
      discriminator: StringTypes.NonEmptyString<D>
    ) => {
      readonly Union: TaggedUnion<Keys, D>;
      readonly Members: TaggedMembersMap<Keys, D>;
    };
  };
  readonly toTagged: <D extends StringTypes.NonEmptyString>(
    discriminator: StringTypes.NonEmptyString<D>
  ) => {
    readonly Union: TaggedUnion<Literals, D>;
    readonly Members: TaggedMembersMap<Literals, D>;
  };
};

export function stringLiteralKit<
  const Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
  const Mapping extends A.NonEmptyReadonlyArray<[Literals[number], StringTypes.NonEmptyString]>,
>(
  ...args: Literals[number] extends StringTypes.NonEmptyString<Literals[number]>
    ? Literals | [...Literals, { readonly enumMapping?: ValidMapping<Literals, Mapping> }]
    : never
): {
  readonly Schema: S.Literal<[...Literals]>;
  readonly Options: Literals;
  readonly Enum: CreateEnumType<Literals, ValidMapping<Literals, Mapping> | undefined>;
  readonly derive: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => {
    readonly Schema: S.Literal<[...Keys]>;
    readonly Options: Keys;
    readonly Enum: CreateEnumType<Keys, undefined>;
    readonly toTagged: <D extends StringTypes.NonEmptyString>(
      discriminator: StringTypes.NonEmptyString<D>
    ) => {
      readonly Union: TaggedUnion<Keys, D>;
      readonly Members: TaggedMembersMap<Keys, D>;
    };
  };
  readonly toTagged: <D extends StringTypes.NonEmptyString>(
    discriminator: StringTypes.NonEmptyString<D>
  ) => {
    readonly Union: TaggedUnion<Literals, D>;
    readonly Members: TaggedMembersMap<Literals, D>;
  };
} {
  // Determine if last argument is options
  const hasOptions =
    A.length(args) > 0 &&
    typeof args[args.length - 1] === "object" &&
    !A.isArray(args[args.length - 1]) &&
    args[args.length - 1] !== null;

  const literals = (hasOptions ? args.slice(0, -1) : args) as Literals;
  const options = hasOptions
    ? (args[args.length - 1] as { readonly enumMapping?: ValidMapping<Literals, Mapping> | undefined })
    : undefined;

  /** Build a Schema.Union of S.Structs tagged by the given discriminator */
  // Build a Schema.Union and a keyed members map for the given discriminator
  const toTagged = <D extends StringTypes.NonEmptyString>(discriminator: StringTypes.NonEmptyString<D>) => {
    // Tuple of S.Struct members (preserves literal order at the type level)
    const memberTuple = F.pipe(
      literals,
      A.map((lit) => TaggedUnion(discriminator)(lit, {}))
    ) as unknown as TaggedMembers<Literals, D>;

    // Keyed object map: { [literal]: S.Struct(...) }
    const membersObj = Object.create(null) as Record<string, S.Struct<UnsafeTypes.UnsafeAny>>;
    A.forEach(literals, (lit, i) => {
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

  const enumFactory = makeMappedEnum(...literals);
  type EnumType = CreateEnumType<Literals, ValidMapping<Literals, Mapping> | undefined>;
  const Enum: EnumType = options?.enumMapping
    ? enumFactory(...options.enumMapping).Enum
    : enumFromStringArray(...literals);

  const Schema = S.Literal(...literals).annotations({
    arbitrary: () => (fc) => fc.constantFrom(...literals),
  });
  return {
    Schema: Schema,
    Options: literals,
    Enum,
    derive: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(...keys: Keys) => {
      const Schema = S.Literal(...keys).annotations({
        arbitrary: () => (fc) => fc.constantFrom(...keys),
      });

      const toTagged = <D extends StringTypes.NonEmptyString>(discriminator: StringTypes.NonEmptyString<D>) => {
        const memberTuple = A.map(keys, (lit) => {
          return TaggedUnion(discriminator)(lit, {});
          // todo: remove this cast
        }) as unknown as TaggedMembers<Keys, D>;

        const membersObj = Object.create(null) as Record<string, S.Struct<UnsafeTypes.UnsafeAny>>;
        A.forEach(keys, (lit, i) => {
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
        Schema: Schema,
        Options: keys,
        Enum: enumFromStringArray(...keys),
        toTagged,
      } as const;
    },
    toTagged,
  } as const;
}

export type LiteralKit<
  Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
  Mapping extends A.NonEmptyReadonlyArray<[Literals[number], StringTypes.NonEmptyString]> | undefined,
  EnumType = Mapping extends undefined ? CreateEnumType<Literals, undefined> : CreateEnumType<Literals, Mapping>,
> = {
  readonly Schema: S.Literal<[...Literals]>;
  readonly Options: Literals;
  readonly Enum: EnumType;
  readonly derive: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ) => {
    readonly Schema: S.Literal<[...Keys]>;
    readonly Options: Keys;
    readonly Enum: CreateEnumType<Keys, undefined>;
    readonly toTagged: <D extends StringTypes.NonEmptyString>(
      discriminator: StringTypes.NonEmptyString<D>
    ) => {
      readonly Union: TaggedUnion<Keys, D>;
      readonly Members: TaggedMembersMap<Keys, D>;
    };
  };
  readonly toTagged: <D extends StringTypes.NonEmptyString>(
    discriminator: StringTypes.NonEmptyString<D>
  ) => {
    readonly Union: TaggedUnion<Literals, D>;
    readonly Members: TaggedMembersMap<Literals, D>;
  };
};
