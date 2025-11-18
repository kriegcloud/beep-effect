/**
 * String literal kit builders that generate schemas, enums, and tagged unions.
 *
 * Centralizes the legacy literal kit logic inside schema-v2 so derived modules share the same toolkit.
 *
 * @example
 * import { stringLiteralKit } from "@beep/schema-v2/derived/kits/string-literal-kit";
 *
 * const StatusKit = stringLiteralKit("pending", "active");
 *
 * @category Derived/Kits
 * @since 0.1.0
 */

import type { TaggedUnion } from "@beep/schema-v2/core/generics/tagged-union";
import { TaggedUnion as TaggedUnionFactory } from "@beep/schema-v2/core/generics/tagged-union";
import { Id } from "@beep/schema-v2/derived/kits/_id";
import type { StringTypes, UnsafeTypes } from "@beep/types";
import { enumFromStringArray } from "@beep/utils";
import type { CreateEnumType, ValidMapping } from "@beep/utils/data/tuple.utils";
import { makeMappedEnum } from "@beep/utils/data/tuple.utils";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";

type TaggedMembers<Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>, D extends string> = {
  readonly [I in keyof Literals]: TaggedUnion.Schema<D, Literals[I] & string, {}>;
} & { readonly length: Literals["length"] };

/**
 * Object map: one member per literal key (like Enum, but values are S.Structs).
 *
 * Maps each literal string to a tagged struct schema with a discriminator field.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type TaggedMembersMap<Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>, D extends string> = {
  readonly [L in Literals[number]]: TaggedUnion.Schema<D, L & string, {}>;
};

/**
 * Tagged union schema type for a set of literals.
 *
 * Constructs a union of tagged structs, each with a discriminator field.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type TaggedUnion<
  Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
  D extends StringTypes.NonEmptyString,
> = S.Union<TaggedMembers<Literals, D>>;

const buildMembersMap = <
  Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
  D extends StringTypes.NonEmptyString,
>(
  values: Literals,
  tuple: TaggedMembers<Literals, D>
): TaggedMembersMap<Literals, D> => {
  const tupleArray = tuple as unknown as ReadonlyArray<S.Struct<UnsafeTypes.UnsafeAny>>;
  const entries = F.pipe(
    values,
    A.reduce([] as ReadonlyArray<readonly [string, S.Struct<UnsafeTypes.UnsafeAny>]>, (acc, literal, index) =>
      F.pipe(
        tupleArray,
        A.get(index),
        O.match({
          onNone: () => acc,
          onSome: (member) => A.append(acc, [literal, member] as const),
        })
      )
    )
  );
  return R.fromEntries(entries) as TaggedMembersMap<Literals, D>;
};

/**
 * Builds a tagged struct schema with the given discriminator and literal value.
 *
 * Uses the TaggedUnion helper to construct properly typed discriminated struct members.
 *
 * @param discriminator - The name of the discriminator field
 * @param lit - The literal value for this member
 * @returns A struct schema with a single discriminator field with optional default
 *
 * @example
 * import * as S from "effect/Schema";
 *
 * const schema = makeTaggedStruct("type", "pending");
 * // TaggedUnion("type")("pending", {})
 *
 * @since 0.1.0
 * @category Derived/Kits
 * @internal
 */
const makeTaggedStruct = <D extends string, L extends string>(discriminator: D, lit: L) =>
  TaggedUnionFactory(discriminator)(lit, {});

/**
 * Factory for creating string literal kits with schema, enum, and tagged union support.
 *
 * This kit builder provides a comprehensive toolkit for working with string literals including:
 * - Schema validation via `effect/Schema` literals
 * - Runtime enums for type-safe constants
 * - FastCheck arbitraries for property-based testing
 * - Tagged unions with discriminator fields
 * - Derived subsets via the `derive` method
 *
 * @param literals - A non-empty array of string literal values
 * @returns A literal kit with Schema, Options, Enum, derive, and toTagged utilities
 *
 * @example
 * import { stringLiteralKit } from "@beep/schema-v2/derived/kits/string-literal-kit";
 *
 * const StatusKit = stringLiteralKit("pending", "active", "suspended");
 * // StatusKit.Schema: S.Literal<["pending", "active", "suspended"]>
 * // StatusKit.Enum: { Pending: "pending", Active: "active", Suspended: "suspended" }
 * // StatusKit.Options: ["pending", "active", "suspended"]
 *
 * const derived = StatusKit.derive("pending", "active");
 * // derived.Schema: S.Literal<["pending", "active"]>
 *
 * const tagged = StatusKit.toTagged("status");
 * // tagged.Union: S.Union<...>
 * // tagged.Members: { pending: S.Struct({ status: "pending" }), ... }
 *
 * @category Derived/Kits
 * @since 0.1.0
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

/**
 * Factory for creating string literal kits with custom enum mapping.
 *
 * Extended overload that accepts an optional `enumMapping` configuration for custom enum key names.
 *
 * @param args - Literals followed by an options object with `enumMapping`
 * @returns A literal kit with Schema, Options, Enum (with custom mapping), derive, and toTagged utilities
 *
 * @example
 * import { stringLiteralKit } from "@beep/schema-v2/derived/kits/string-literal-kit";
 *
 * const StatusKit = stringLiteralKit("pending", "active", {
 *   enumMapping: [
 *     ["pending", "PENDING_STATUS"],
 *     ["active", "ACTIVE_STATUS"],
 *   ],
 * });
 * // StatusKit.Enum: { PENDING_STATUS: "pending", ACTIVE_STATUS: "active" }
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
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

/**
 * Implementation of string literal kit factory.
 *
 * @internal
 */
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
  const argsLength = F.pipe(args as readonly unknown[], A.length);
  const lastArg = F.pipe(args as readonly unknown[], A.get(argsLength - 1));
  const hasOptions = F.pipe(
    lastArg,
    O.map((arg) => typeof arg === "object" && !A.isArray(arg) && arg !== null),
    O.getOrElse(() => false)
  );

  const literals = (hasOptions ? F.pipe(args as readonly unknown[], A.take(argsLength - 1)) : args) as Literals;
  const options = F.pipe(
    hasOptions ? lastArg : O.none(),
    O.filter((arg): arg is { readonly enumMapping?: ValidMapping<Literals, Mapping> } => typeof arg === "object"),
    O.getOrNull
  );

  /**
   * Build a Schema.Union of S.Structs tagged by the given discriminator.
   *
   * @internal
   */
  const toTagged = <D extends StringTypes.NonEmptyString>(discriminator: StringTypes.NonEmptyString<D>) => {
    // Tuple of S.Struct members (preserves literal order at the type level)
    const memberTuple = F.pipe(
      literals,
      A.map((lit) => makeTaggedStruct(discriminator, lit))
    ) as unknown as TaggedMembers<Literals, D>;

    // The union schema constructed from the tuple of members
    const Union = S.Union(
      ...(memberTuple as unknown as [
        S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>,
        ...S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>[],
      ])
    ) as TaggedUnion<Literals, D>;

    return {
      Union,
      Members: buildMembersMap(literals, memberTuple),
    } as const;
  };

  const enumFactory = makeMappedEnum(...literals);
  type EnumType = CreateEnumType<Literals, ValidMapping<Literals, Mapping> | undefined>;
  const Enum: EnumType =
    options?.enumMapping !== undefined ? enumFactory(...options.enumMapping).Enum : enumFromStringArray(...literals);

  const Schema = S.Literal(...literals).annotations(
    Id.annotations("StringLiteralKitLiteral", {
      arbitrary: () => (fc) => fc.constantFrom(...literals),
      description: "Literal schema produced by stringLiteralKit",
    })
  );
  return {
    Schema: Schema,
    Options: literals,
    Enum,
    derive: <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(...keys: Keys) => {
      const Schema = S.Literal(...keys).annotations(
        Id.annotations("StringLiteralKitLiteral", {
          description: "Literal schema produced by stringLiteralKit",
          arbitrary: () => (fc) => fc.constantFrom(...keys),
        })
      );

      const toTagged = <D extends StringTypes.NonEmptyString>(discriminator: StringTypes.NonEmptyString<D>) => {
        const memberTuple = F.pipe(
          keys,
          A.map((lit) => makeTaggedStruct(discriminator, lit))
        ) as unknown as TaggedMembers<Keys, D>;

        const Union = S.Union(
          ...(memberTuple as unknown as [
            S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>,
            ...S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>[],
          ])
        ) as TaggedUnion<Keys, D>;

        return {
          Union,
          Members: buildMembersMap(keys, memberTuple),
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

/**
 * Type representing a literal kit instance.
 *
 * Captures the shape of the kit returned by `stringLiteralKit` including optional enum mapping.
 *
 * @example
 * import type { LiteralKit } from "@beep/schema-v2/derived/kits/string-literal-kit";
 *
 * type StatusKit = LiteralKit<readonly ["pending", "active"], undefined>;
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
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
