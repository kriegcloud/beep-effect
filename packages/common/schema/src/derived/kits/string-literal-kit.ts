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

import { DiscriminatedStruct } from "@beep/schema/core/generics";
import { mergeFields } from "@beep/schema/core/utils/merge-fields";
import type { UnsafeTypes } from "@beep/types";
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
import type { TaggedUnion } from "../../core/generics/tagged-union";
import { TaggedUnion as TaggedUnionFactory } from "../../core/generics/tagged-union";

export type LiteralsType = A.NonEmptyReadonlyArray<string>;

type LiteralsSubset<Literals extends LiteralsType> = A.NonEmptyReadonlyArray<Literals[number]>;

type MappingType<Literals extends LiteralsType> = A.NonEmptyReadonlyArray<[Literals[number], string]>;

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
type TaggedUnion<Literals extends LiteralsType, D extends string> = S.Union<TaggedMembers<Literals, D>>;

type TaggedMembersResult<Literals extends LiteralsType, D extends string> = {
  readonly Union: TaggedUnion<Literals, D>;
  readonly Members: TaggedMembersMap<Literals, D>;
  readonly composer: StructComposer<Literals, D>;
};
// type Composer = {
//           readonly [K in Literals[number]]: <Fields extends S.Struct.Fields>(fields: Fields) => DiscriminatedStruct.Schema<D, K, Fields>
//         }
//         const structFactory = DiscriminatedStruct.make(discriminator)
//         const composerFn = F.flow(
//           <Tag extends Literals[number]>(tag: Tag) => <Fields extends S.Struct.Fields>(fields: Fields) =>
//             structFactory(tag, fields)
//         )
//         const composer: Composer = F.pipe(
//           literals,
//           ArrayUtils.NonEmptyReadonly.mapNonEmpty((lit) => [lit, composerFn(lit)]),
//           A.reduce({} as Composer, (acc, [key, value]) => ({ ...acc, [key]: value }))
//         )

/**
 * Composable struct factory with support for default fields.
 *
 * Can be called as a function to create a new composer with default fields:
 * - `composer(defaultFields)` → returns new composer with defaults
 *
 * Can be called as an object with literal methods:
 * - `composer.select(fields)` → creates struct with discriminator + fields
 *
 * When called with defaults first, creates nested composition:
 * - `composer(defaults).select(fields)` → struct with discriminator + defaults + fields
 *
 * @example
 * import { StringLiteralKit } from "@beep/schema/derived/kits/string-literal-kit";
 * import * as S from "effect/Schema";
 *
 * class ModelVariant extends StringLiteralKit("select", "insert", "update") {}
 *
 * const factory = ModelVariant.toTagged("variant").composer({
 *   id: S.String,
 *   createdAt: S.DateTimeUtc
 * });
 *
 * class SelectModel extends factory.select({ data: S.String }) {}
 * // Produces: { variant: "select", id: string, createdAt: DateTime.Utc, data: string }
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
export type StructComposer<
  Literals extends LiteralsType,
  D extends string,
  Defaults extends S.Struct.Fields = {}
> = {
  /**
   * Call with default fields to create a new composer with those defaults baked in.
   */
  <const DefaultFields extends S.Struct.Fields>(
    defaultFields: DefaultFields
  ): StructComposer<Literals, D, Defaults & DefaultFields>;
} & {
  /**
   * Method accessors for each literal - merges defaults with new fields.
   */
  readonly [K in Literals[number]]: <Fields extends S.Struct.Fields>(
    fields: Fields
  ) => DiscriminatedStruct.Schema<D, K, Defaults & Fields>;
};

/**
 * Creates a callable struct composer with support for default fields.
 *
 * The returned composer can be:
 * 1. Called as a function with default fields to create a new composer with those defaults
 * 2. Accessed via literal methods to create discriminated structs
 *
 * @param literals - Array of literal string values
 * @param discriminator - The discriminator field name
 * @param defaults - Default fields to merge into all variants (defaults to empty)
 * @returns A callable StructComposer with literal methods
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
const makeComposer = <
  const Literals extends LiteralsType,
  const D extends string,
  const Defaults extends S.Struct.Fields = {}
>(
  literals: Literals,
  discriminator: D,
  defaults: Defaults = {} as Defaults
): StructComposer<Literals, D, Defaults> => {
  const structFactory = DiscriminatedStruct.make(discriminator);

  // Create literal methods - each merges defaults with new fields
  const composerMethods = F.pipe(
    literals,
    ArrayUtils.NonEmptyReadonly.mapNonEmpty((lit) => {
      const method = <Fields extends S.Struct.Fields>(fields: Fields) =>
        structFactory(lit, mergeFields(defaults, fields));
      return [lit, method] as const;
    }),
    A.reduce({} as Record<string, unknown>, (acc, [key, method]) => ({
      ...acc,
      [key]: method,
    }))
  );

  // Create callable function that returns a new composer with extended defaults
  const composerFn = <const DefaultFields extends S.Struct.Fields>(
    defaultFields: DefaultFields
  ): StructComposer<Literals, D, Defaults & DefaultFields> =>
    makeComposer(literals, discriminator, mergeFields(defaults, defaultFields));

  // Merge callable function with literal methods
  return Object.assign(composerFn, composerMethods) as StructComposer<Literals, D, Defaults>;
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
  readonly derive: <Keys extends LiteralsSubset<Literals>>(...keys: Keys) => ILiteralKit<Keys, undefined>;
  readonly toTagged: <const D extends string>(discriminator: D) => TaggedMembersResult<Literals, D>;
}

const buildMembersMap = <Literals extends A.NonEmptyReadonlyArray<string>, D extends string>(
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
const makeTaggedStruct = <const D extends string, L extends string>(discriminator: D, lit: L) =>
  TaggedUnionFactory(discriminator)(lit, {});

/**
 * Checks whether the provided array of literals constitutes multiple members.
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export function isMembers<A>(as: ReadonlyArray<A>): as is AST.Members<A> {
  return as.length > 1;
}

/**
 * Maps members using the provided function while preserving member metadata.
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export function mapMembers<A, B>(members: AST.Members<A>, f: (a: A) => B): AST.Members<B> {
  return A.map(members, f) as UnsafeTypes.UnsafeAny;
}

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
 * Factory for creating string literal kits without enum mapping.
 *
 * @returns A literal kit with Schema, Options, Enum, derive, and toTagged utilities
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export function makeLiteralKit<const Literals extends A.NonEmptyReadonlyArray<string>>(
  literals: Literals,
  enumMapping: undefined,
  ast?: AST.AST | undefined
): ILiteralKit<Literals, undefined>;

/**
 * Factory for creating string literal kits with custom enum mapping.
 *
 * Extended overload that accepts an `enumMapping` configuration for custom enum key names.
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
  const Literals extends A.NonEmptyReadonlyArray<string>,
  const Mapping extends A.NonEmptyReadonlyArray<[Literals[number], string]>,
>(
  literals: Literals,
  enumMapping: ValidMapping<Literals, Mapping>,
  ast?: AST.AST | undefined
): ILiteralKit<Literals, Mapping>;

/**
 * Implementation of string literal kit factory.
 *
 */
export function makeLiteralKit<
  const Literals extends A.NonEmptyReadonlyArray<string>,
  const Mapping extends A.NonEmptyReadonlyArray<[Literals[number], string]>,
>(
  literals: Literals,
  enumMapping?: ValidMapping<Literals, Mapping> | undefined,
  ast: AST.AST = getDefaultLiteralAST(literals)
): ILiteralKit<Literals, ValidMapping<Literals, Mapping> | undefined> {
  /**
   * Build a Schema.Union of S.Structs tagged by the given discriminator.
   *
   */
  const toTagged = <const D extends string>(discriminator: D): TaggedMembersResult<Literals, D> => {
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
      composer: makeComposer(literals, discriminator),
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
      return (
        enumMapping
          ? makeLiteralKit(this.Options, enumMapping, mergeSchemaAnnotations(this.ast, annotations))
          : makeLiteralKit(this.Options, undefined, mergeSchemaAnnotations(this.ast, annotations))
      ) as ILiteralKit<Literals, Mapping>;
    }

    static omitOptions = omitOptions;
    static pickOptions = pickOptions;
    static Options = literals;
    static Enum = Enum;
    static is = buildIsGuards(literals);
    static derive = <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
      ...keys: Keys
    ): ILiteralKit<Keys, undefined> => makeLiteralKit(keys, undefined);
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
export function StringLiteralKit<const Literals extends LiteralsType>(
  ...literals: Literals
): ILiteralKit<Literals, undefined>;
export function StringLiteralKit<
  const Literals extends A.NonEmptyReadonlyArray<string>,
  const Mapping extends A.NonEmptyReadonlyArray<[Literals[number], string]>,
>(
  ...args: [...literals: Literals, options: { readonly enumMapping: ValidMapping<Literals, Mapping> }]
): ILiteralKit<Literals, Mapping>;
export function StringLiteralKit<
  const Literals extends A.NonEmptyReadonlyArray<string>,
  const Mapping extends A.NonEmptyReadonlyArray<[Literals[number], string]>,
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
    O.flatMap((opts) => O.fromNullable(opts.enumMapping)),
    O.match({
      onNone: () => makeLiteralKit(literals, undefined),
      onSome: (mapping) => makeLiteralKit(literals, mapping as ValidMapping<Literals, Mapping>),
    })
  );
}
