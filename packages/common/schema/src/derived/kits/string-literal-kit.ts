/**
 * String literal kit builders that generate schemas, enums, and tagged unions.
 *
 * Centralizes the legacy literal kit logic inside schema so derived modules share the same toolkit.
 *
 * @example
 * import { StringLiteralKit } from "@beep/schema/derived/kits/string-literal-kit";
 *
 * const StatusKit = StringLiteralKit("pending", "active");
 * // StatusKit.is.pending(value) - type guard for "pending"
 * // StatusKit.is.active(value) - type guard for "active"
 *
 * @category Derived/Kits
 * @since 0.1.0
 */

import type { TaggedUnion } from "@beep/schema/core/generics/tagged-union";
import { TaggedUnion as TaggedUnionFactory } from "@beep/schema/core/generics/tagged-union";
import { $KitsId } from "@beep/schema/internal";
import type { StringTypes, UnsafeTypes } from "@beep/types";
import { ArrayUtils, enumFromStringArray } from "@beep/utils";
import type { CreateEnumType, ValidMapping } from "@beep/utils/data/tuple.utils";
import { makeMappedEnum } from "@beep/utils/data/tuple.utils";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import type * as Types from "effect/Types";

// const LiteralToAccessor =

const { $StringLiteralKitId: Id } = $KitsId.compose("string-literal-kit");
type LiteralsType = A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>;

type LiteralsSubset<Literals extends LiteralsType> = A.NonEmptyReadonlyArray<Literals[number]>;

type MappingType<Literals extends LiteralsType> = A.NonEmptyReadonlyArray<
  [Literals[number], StringTypes.NonEmptyString]
>;

type TaggedMembers<Literals extends LiteralsType, D extends string> = {
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
type TaggedMembersMap<Literals extends LiteralsType, D extends string> = {
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
type TaggedUnion<Literals extends LiteralsType, D extends StringTypes.NonEmptyString> = S.Union<
  TaggedMembers<Literals, D>
>;

type TaggedMembersResult<Literals extends LiteralsType, D extends StringTypes.NonEmptyString> = {
  readonly Union: TaggedUnion<Literals, D>;
  readonly Members: TaggedMembersMap<Literals, D>;
};

type PickOptions<Literals extends LiteralsType> = <const Keys extends LiteralsSubset<Literals>>(
  ...keys: Keys
) => LiteralsSubset<Keys>;

type OmitOptions<Literals extends LiteralsType> = <const Keys extends LiteralsSubset<Literals>>(
  ...keys: Keys
) => A.NonEmptyReadonlyArray<Exclude<Literals[number], Keys[number]>>;

/**
 * Type guard map: one guard per literal key.
 *
 * Maps each literal string to a type guard function that narrows `unknown` to that specific literal.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type IsGuards<Literals extends LiteralsType> = {
  readonly [K in Literals[number] & string]: (i: unknown) => i is K;
};

type DerivedLiteralKit<Literals extends LiteralsType> = {
  readonly Schema: S.Literal<[...Literals]>;
  readonly Options: Literals;
  readonly Enum: CreateEnumType<Literals, undefined>;
  readonly omitOptions: OmitOptions<Literals>;
  readonly pickOptions: PickOptions<Literals>;
  readonly toTagged: <D extends StringTypes.NonEmptyString>(
    discriminator: StringTypes.NonEmptyString<D>
  ) => TaggedMembersResult<Literals, D>;
};

type DerivedLiteralKitSchema<Literals extends LiteralsType> = DerivedLiteralKit<Literals>;

type LiteralKitEnum<
  Literals extends LiteralsType,
  Mapping extends MappingType<Literals> | undefined,
> = Mapping extends undefined ? CreateEnumType<Literals, undefined> : CreateEnumType<Literals, Mapping>;

/**
 * Type representing a literal kit instance.
 *
 * Captures the shape of the kit returned by `stringLiteralKit` including optional enum mapping.
 *
 * @example
 * import type { ILiteralKit } from "@beep/schema/derived/kits/string-literal-kit";
 *
 * type StatusKit = ILiteralKit<readonly ["pending", "active"], undefined>;
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
export interface ILiteralKit<Literals extends LiteralsType, Mapping extends MappingType<Literals> | undefined>
  extends S.AnnotableClass<ILiteralKit<Literals, Mapping>, Literals[number]> {
  readonly Options: Literals;
  readonly Enum: LiteralKitEnum<Literals, Mapping>;
  readonly is: IsGuards<Literals>;
  readonly omitOptions: OmitOptions<Literals>;
  readonly pickOptions: PickOptions<Literals>;
  readonly derive: <Keys extends LiteralsSubset<Literals>>(...keys: Keys) => DerivedLiteralKit<Keys>;
  readonly toTagged: <D extends StringTypes.NonEmptyString>(
    discriminator: StringTypes.NonEmptyString<D>
  ) => TaggedMembersResult<Literals, D>;
}

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
 */
const makeTaggedStruct = <D extends string, L extends string>(discriminator: D, lit: L) =>
  TaggedUnionFactory(discriminator)(lit, {});
/**
 * Checks whether the provided array of literals constitutes multiple members.
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export const isMembers = <A>(as: ReadonlyArray<A>): as is AST.Members<A> => as.length > 1;
/**
 * Maps members using the provided function while preserving member metadata.
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export const mapMembers = <A, B>(members: AST.Members<A>, f: (a: A) => B): AST.Members<B> =>
  A.map(members, f) as UnsafeTypes.UnsafeAny;

function getDefaultLiteralAST<Literals extends A.NonEmptyReadonlyArray<AST.LiteralValue>>(literals: Literals): AST.AST {
  return isMembers(literals)
    ? AST.Union.make(mapMembers(literals, (literal) => new AST.Literal(literal)))
    : new AST.Literal(literals[0]);
}

interface AllAnnotations<A, TypeParameters extends ReadonlyArray<UnsafeTypes.UnsafeAny>>
  extends S.Annotations.Schema<A, TypeParameters>,
    S.PropertySignature.Annotations<A> {}

const builtInAnnotations = {
  schemaId: AST.SchemaIdAnnotationId,
  message: AST.MessageAnnotationId,
  missingMessage: AST.MissingMessageAnnotationId,
  identifier: AST.IdentifierAnnotationId,
  title: AST.TitleAnnotationId,
  description: AST.DescriptionAnnotationId,
  examples: AST.ExamplesAnnotationId,
  default: AST.DefaultAnnotationId,
  documentation: AST.DocumentationAnnotationId,
  jsonSchema: AST.JSONSchemaAnnotationId,
  arbitrary: AST.ArbitraryAnnotationId,
  pretty: AST.PrettyAnnotationId,
  equivalence: AST.EquivalenceAnnotationId,
  concurrency: AST.ConcurrencyAnnotationId,
  batching: AST.BatchingAnnotationId,
  parseIssueTitle: AST.ParseIssueTitleAnnotationId,
  parseOptions: AST.ParseOptionsAnnotationId,
  decodingFallback: AST.DecodingFallbackAnnotationId,
};

const toASTAnnotations = <A, TypeParameters extends ReadonlyArray<UnsafeTypes.UnsafeAny>>(
  annotations?: AllAnnotations<A, TypeParameters>
): AST.Annotations => {
  if (!annotations) {
    return {};
  }
  const out: Types.Mutable<AST.Annotations> = { ...annotations };

  for (const key in builtInAnnotations) {
    if (key in annotations) {
      const id = builtInAnnotations[key as keyof typeof builtInAnnotations];
      out[id] = annotations[key as keyof typeof annotations];
      delete out[key];
    }
  }

  return out;
};

const mergeSchemaAnnotations = <A>(ast: AST.AST, annotations: S.Annotations.Schema<A>): AST.AST =>
  AST.annotations(ast, toASTAnnotations(annotations));

/**
 * Builds a map of type guards for each literal value.
 *
 * @param literals - Array of literal strings to create guards for
 * @returns An object with a type guard function for each literal
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
const buildIsGuards = <Literals extends LiteralsType>(literals: Literals): IsGuards<Literals> => {
  const entries = F.pipe(
    literals,
    A.map((lit) => [lit, (i: unknown): i is typeof lit => i === lit] as const)
  );
  return R.fromEntries(entries) as IsGuards<Literals>;
};

/**
 * Factory for creating string literal kits with custom enum mapping.
 *
 * Extended overload that accepts an optional `enumMapping` configuration for custom enum key names.
 *
 * @returns A literal kit with Schema, Options, Enum (with custom mapping), derive, and toTagged utilities
 *
 * @example
 * import { StringLiteralKit } from "@beep/schema/derived/kits/string-literal-kit";
 *
 * const StatusKit = StringLiteralKit("pending", "active", {
 *   enumMapping: [
 *     ["pending", "PENDING_STATUS"],
 *     ["active", "ACTIVE_STATUS"],
 *   ],
 * });
 * // StatusKit.Enum: { PENDING_STATUS: "pending", ACTIVE_STATUS: "active" }
 *
 * @category Derived/Kits
 * @since 0.1.0
 * @param literals
 * @param enumMapping
 * @param ast
 */
export function makeLiteralKit<
  const Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
  const Mapping extends A.NonEmptyReadonlyArray<[Literals[number], StringTypes.NonEmptyString]>,
>(
  literals: Literals,
  enumMapping: ValidMapping<Literals, Mapping> | undefined,
  ast?: AST.AST | undefined
): ILiteralKit<Literals, Mapping>;

/**
 * Implementation of string literal kit factory.
 *
 */
export function makeLiteralKit<
  const Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
  const Mapping extends A.NonEmptyReadonlyArray<[Literals[number], StringTypes.NonEmptyString]>,
>(
  literals: Literals,
  enumMapping?: ValidMapping<Literals, Mapping> | undefined,
  ast: AST.AST = getDefaultLiteralAST(literals)
): ILiteralKit<Literals, ValidMapping<Literals, Mapping> | undefined> {
  /**
   * Build a Schema.Union of S.Structs tagged by the given discriminator.
   *
   */
  const toTagged = <D extends StringTypes.NonEmptyString>(
    discriminator: StringTypes.NonEmptyString<D>
  ): TaggedMembersResult<Literals, D> => {
    // Tuple of S.Struct members (preserves literal order at the type level)
    const memberTuple = F.pipe(
      literals,
      A.map((lit) => makeTaggedStruct(discriminator, lit))
    ) as TaggedMembers<Literals, D>;

    // The union schema constructed from the tuple of members
    const Union = S.Union(
      ...(memberTuple as [
        S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>,
        ...S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>[],
      ])
    ) as TaggedUnion<Literals, D>;

    return {
      Union,
      Members: buildMembersMap(literals, memberTuple),
    };
  };

  const enumFactory = makeMappedEnum(...literals);
  type EnumType = CreateEnumType<Literals, ValidMapping<Literals, Mapping> | undefined>;
  const Enum: EnumType = F.pipe(
    enumMapping,
    O.fromNullable,
    O.match({
      onNone: () => enumFromStringArray(...literals),
      onSome: (mapping) => enumFactory(...(mapping as ValidMapping<Literals, Mapping>)).Enum,
    })
  );

  const pickOptions = <Keys extends LiteralsSubset<Literals>>(...keys: Keys): A.NonEmptyReadonlyArray<Keys[number]> =>
    F.pipe(
      literals,
      ArrayUtils.NonEmptyReadonly.filter((lit) => A.contains(keys, lit))
    );

  const omitOptions = <Keys extends LiteralsSubset<Literals>>(
    ...keys: Keys
  ): A.NonEmptyReadonlyArray<Exclude<Literals[number], Keys[number]>> =>
    F.pipe(
      literals,
      ArrayUtils.NonEmptyReadonly.filter((lit) => !A.contains(keys, lit))
    ) as unknown as A.NonEmptyReadonlyArray<Exclude<Literals[number], Keys[number]>>;

  return class WithStatics extends S.make<Literals[number]>(ast) {
    static override annotations(annotations: S.Annotations.Schema<Literals[number]>): ILiteralKit<Literals, Mapping> {
      return enumMapping
        ? makeLiteralKit(this.Options, enumMapping, mergeSchemaAnnotations(this.ast, annotations))
        : makeLiteralKit(this.Options, undefined, mergeSchemaAnnotations(this.ast, annotations));
    }

    static omitOptions = omitOptions;
    static pickOptions = pickOptions;
    static Options = literals;
    static Enum = Enum;
    static is = buildIsGuards(literals);
    static derive = <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
      ...keys: Keys
    ): DerivedLiteralKitSchema<Keys> => {
      const Schema = S.Literal(...keys).annotations(
        Id.annotations("StringLiteralKitLiteral", {
          description: "Literal schema produced by stringLiteralKit",
          arbitrary: () => (fc) => fc.constantFrom(...keys),
        })
      );

      const toTagged = <D extends StringTypes.NonEmptyString>(
        discriminator: StringTypes.NonEmptyString<D>
      ): TaggedMembersResult<Keys, D> => {
        const memberTuple = F.pipe(
          keys,
          A.map((lit) => makeTaggedStruct(discriminator, lit))
        ) as TaggedMembers<Keys, D>;

        const Union = S.Union(
          ...(memberTuple as [
            S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>,
            ...S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>[],
          ])
        ) as TaggedUnion<Keys, D>;

        return {
          Union,
          Members: buildMembersMap(keys, memberTuple),
        };
      };

      const pickOptions = <KeysDerived extends LiteralsSubset<Keys>>(
        ...keysDerived: KeysDerived
      ): A.NonEmptyReadonlyArray<KeysDerived[number]> =>
        F.pipe(
          keys,
          ArrayUtils.NonEmptyReadonly.filter((lit) => A.contains(keysDerived, lit))
        );

      const omitOptions = <KeysDerived extends LiteralsSubset<Keys>>(
        ...keysDerived: KeysDerived
      ): A.NonEmptyReadonlyArray<Exclude<Keys[number], KeysDerived[number]>> =>
        F.pipe(
          keys,
          ArrayUtils.NonEmptyReadonly.filter((lit) => !A.contains(keysDerived, lit))
        ) as unknown as A.NonEmptyReadonlyArray<Exclude<Keys[number], KeysDerived[number]>>;

      return {
        Options: keys,
        Enum: enumFromStringArray(...keys),
        toTagged,
        omitOptions,
        pickOptions,
        Schema,
      };
    };
    static toTagged = toTagged;
  };
}

/**
 * Factory for creating string literal kits with optional enum mappings.
 *
 * Provides `Schema`, `Options`, `Enum`, `derive`, and `toTagged` helpers for literal unions.
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export function StringLiteralKit<Literals extends LiteralsType>(
  ...literals: Literals
): ILiteralKit<Literals, undefined>;
export function StringLiteralKit<
  const Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
  const Mapping extends A.NonEmptyReadonlyArray<[Literals[number], StringTypes.NonEmptyString]>,
>(
  ...args: [...literals: Literals, options: { readonly enumMapping: ValidMapping<Literals, Mapping> }]
): ILiteralKit<Literals, Mapping>;
export function StringLiteralKit<
  const Literals extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
  const Mapping extends A.NonEmptyReadonlyArray<[Literals[number], StringTypes.NonEmptyString]>,
>(
  ...args: Literals | [...Literals, { readonly enumMapping?: ValidMapping<Literals, Mapping> }]
): S.SchemaClass<Literals[number]> | S.Never {
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

  return O.fromNullable(options).pipe(
    O.match({
      onNone: () => makeLiteralKit(literals, undefined),
      onSome: (opts) => makeLiteralKit(literals, opts.enumMapping),
    })
  );
}
