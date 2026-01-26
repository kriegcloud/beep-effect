/**
 * Tagged values kit that transforms string literal keys to tagged value arrays.
 *
 * Provides bidirectional transformation where:
 * - Decode: `"a"` → `{ _tag: "a", values: ["charset", "coords", "download", ...] }`
 * - Encode: `{ _tag: "a", values: [...] }` → `"a"` (validates exact match)
 *
 * @example
 * import { TaggedValuesKit } from "@beep/schema/derived/kits/tagged-values-kit";
 *
 * const AllowedAttributesFor = TaggedValuesKit(
 *   ["a", ["charset", "coords", "download", "href", "hreflang"]],
 *   ["img", ["src", "alt", "width", "height", "loading"]],
 * );
 *
 * // Direct value access
 * AllowedAttributesFor.ValuesFor.a  // ["charset", "coords", "download", "href", "hreflang"]
 *
 * // LiteralKit for oneOf validation
 * AllowedAttributesFor.LiteralKitFor.a  // IGenericLiteralKit for "a" values
 * S.decodeSync(AllowedAttributesFor.LiteralKitFor.a)("href")  // valid
 * S.decodeSync(AllowedAttributesFor.LiteralKitFor.a)("src")   // throws (not in "a")
 *
 * // Tag utilities
 * AllowedAttributesFor.Tags      // ["a", "img"]
 * AllowedAttributesFor.TagsEnum  // { a: "a", img: "img" }
 *
 * // Decode: literal → tagged struct
 * import * as S from "effect/Schema";
 * S.decodeSync(AllowedAttributesFor)("a")  // { _tag: "a", values: [...] }
 *
 * // Encode: tagged struct → literal (validates exact match)
 * S.encodeSync(AllowedAttributesFor)({ _tag: "a", values: [...] })  // "a"
 *
 * @category Derived/Kits
 * @since 0.1.0
 */

import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as Data from "effect/Data";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import * as Struct from "effect/Struct";
import { mergeSchemaAnnotations } from "../../core/annotations/built-in-annotations";
import { type IGenericLiteralKit, makeGenericLiteralKit } from "./literal-kit";

/**
 * Error thrown when an unexpected tag is encountered during decode.
 * This should never happen since tags are validated by the literal union schema.
 *
 * @since 0.1.0
 * @category Errors
 */
export class TaggedValuesKitDecodeError extends Data.TaggedError("TaggedValuesKitDecodeError")<{
  readonly tag: string;
  readonly message: string;
}> {}

/**
 * Error thrown when encode validation fails (values don't match exactly).
 *
 * @since 0.1.0
 * @category Errors
 */
export class TaggedValuesKitEncodeError extends Data.TaggedError("TaggedValuesKitEncodeError")<{
  readonly tag: string;
  readonly expected: ReadonlyArray<AST.LiteralValue>;
  readonly received: ReadonlyArray<AST.LiteralValue>;
  readonly message: string;
}> {}

// ============================================================================
// Type Utilities
// ============================================================================

/**
 * Single entry type: [tag, values].
 * Values must be a non-empty array of literal values.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type TaggedValuesEntry = readonly [string, A.NonEmptyReadonlyArray<AST.LiteralValue>];

/**
 * Entries array type - non-empty readonly array of entries.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type TaggedValuesEntries = A.NonEmptyReadonlyArray<TaggedValuesEntry>;

/**
 * Extract tag literals from entries as a union type.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type ExtractTags<E extends TaggedValuesEntries> = E[number][0];

/**
 * Extract values array from an entry.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type ExtractValues<Entry extends TaggedValuesEntry> = Entry[1];

/**
 * Build a decoded config type from tag and values.
 * Structure: `{ _tag: Tag, values: Values }`
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type DecodedConfig<Tag extends string, Values extends A.NonEmptyReadonlyArray<AST.LiteralValue>> = {
  readonly _tag: Tag;
  readonly values: Values;
};

/**
 * Build the decoded union type from entries.
 * Each entry becomes a discriminated struct with `_tag` and `values` fields.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type DecodedUnion<E extends TaggedValuesEntries> = E[number] extends readonly [
  infer T extends string,
  infer V extends A.NonEmptyReadonlyArray<AST.LiteralValue>,
]
  ? DecodedConfig<T, V>
  : never;

/**
 * Recursive helper to build tags tuple type from entries.
 * Uses accumulator pattern from Effect Schema for precise tuple inference.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type TagsArrayRec<E, Out extends ReadonlyArray<string> = readonly []> = E extends readonly [
  infer Head extends TaggedValuesEntry,
  ...infer Tail,
]
  ? Tail extends readonly []
    ? readonly [...Out, Head[0]]
    : TagsArrayRec<Tail, readonly [...Out, Head[0]]>
  : Out;

/**
 * Tags array type - tuple of all tag strings.
 * Uses recursive inference for precise positional types.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type TagsArray<E extends TaggedValuesEntries> = TagsArrayRec<E>;

/**
 * Tags enum type - maps tag strings to themselves.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type TagsEnum<E extends TaggedValuesEntries> = {
  readonly [Entry in E[number] as Entry[0]]: Entry[0];
};

/**
 * Configs accessor type - maps tag strings to their decoded config structs.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type ConfigsAccessor<E extends TaggedValuesEntries> = {
  readonly [Entry in E[number] as Entry[0]]: DecodedConfig<Entry[0], ExtractValues<Entry>>;
};

/**
 * ValuesFor accessor type - maps tag strings directly to their values arrays.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type ValuesForAccessor<E extends TaggedValuesEntries> = {
  readonly [Entry in E[number] as Entry[0]]: ExtractValues<Entry>;
};

/**
 * LiteralKitFor accessor type - maps tag strings to IGenericLiteralKit instances.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type LiteralKitForAccessor<E extends TaggedValuesEntries> = {
  readonly [Entry in E[number] as Entry[0]]: IGenericLiteralKit<ExtractValues<Entry>>;
};

/**
 * Type guard map: one guard per tag.
 *
 * Maps each tag string to a type guard function that narrows a value to that specific config.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type ConfigGuards<E extends TaggedValuesEntries> = {
  readonly [Entry in E[number] as Entry[0]]: (value: {
    readonly _tag: string;
  }) => value is DecodedConfig<Entry[0], ExtractValues<Entry>>;
};

/**
 * Subset of tags from a parent entries type.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type TagsSubset<E extends TaggedValuesEntries> = A.NonEmptyReadonlyArray<ExtractTags<E>>;

/**
 * Helper to extract entry by tag from entries.
 * Uses infer to preserve specific entry type.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type EntryForTag<E extends TaggedValuesEntries, Tag extends ExtractTags<E>> = Extract<
  E[number],
  readonly [Tag, A.NonEmptyReadonlyArray<AST.LiteralValue>]
>;

/**
 * Filter entries to subset of tags with preserved types.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type FilteredEntries<E extends TaggedValuesEntries, Tags extends ExtractTags<E>> = A.NonEmptyReadonlyArray<
  EntryForTag<E, Tags>
>;

/**
 * Schema members type - ensures non-empty tuple for S.Union.
 * Used to document that the source array is guaranteed non-empty.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type SchemaMembers<T> = readonly [S.Schema<T>, ...S.Schema<T>[]];

/**
 * Transform entries to their literal schemas.
 * Uses mapped tuple type pattern from Effect Schema.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type EntriesToLiteralSchemas<E extends TaggedValuesEntries> = {
  readonly [I in keyof E]: E[I] extends TaggedValuesEntry ? S.Schema<E[I][0], E[I][0]> : never;
};

/**
 * Transform entries to their decoded struct schemas.
 * Each entry becomes a Schema for `{ _tag: Tag, values: Values }`.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type EntriesToStructSchemas<E extends TaggedValuesEntries> = {
  readonly [I in keyof E]: E[I] extends readonly [
    infer Tag extends string,
    infer Values extends A.NonEmptyReadonlyArray<AST.LiteralValue>,
  ]
    ? S.Schema<DecodedConfig<Tag, Values>, DecodedConfig<Tag, Values>>
    : never;
};

// ============================================================================
// Interface
// ============================================================================

/**
 * Interface representing a tagged values kit instance.
 *
 * Combines transform schema functionality with direct values access and LiteralKit generation.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
export interface ITaggedValuesKit<Entries extends TaggedValuesEntries>
  extends S.AnnotableClass<ITaggedValuesKit<Entries>, DecodedUnion<Entries>, ExtractTags<Entries>> {
  /**
   * Direct access to config structs by tag.
   *
   * @example
   * AllowedAttributesFor.Configs.a // { _tag: "a", values: ["charset", ...] }
   */
  readonly Configs: ConfigsAccessor<Entries>;

  /**
   * Direct access to values arrays by tag (without the `_tag` wrapper).
   *
   * @example
   * AllowedAttributesFor.ValuesFor.a // ["charset", "coords", "download", ...]
   */
  readonly ValuesFor: ValuesForAccessor<Entries>;

  /**
   * LiteralKit for each tag's values (oneOf validation).
   *
   * @example
   * AllowedAttributesFor.LiteralKitFor.a  // IGenericLiteralKit
   * S.decodeSync(AllowedAttributesFor.LiteralKitFor.a)("href")  // valid
   * S.decodeSync(AllowedAttributesFor.LiteralKitFor.a)("src")   // throws
   */
  readonly LiteralKitFor: LiteralKitForAccessor<Entries>;

  /**
   * Array of all tags (like StringLiteralKit.Options).
   *
   * @example
   * AllowedAttributesFor.Tags // ["a", "img"]
   */
  readonly Tags: TagsArray<Entries>;

  /**
   * Enum-like accessor for tags.
   *
   * @example
   * AllowedAttributesFor.TagsEnum.a // "a"
   */
  readonly TagsEnum: TagsEnum<Entries>;

  /**
   * The original entries used to construct this kit.
   */
  readonly Entries: Entries;

  /**
   * Type guards for narrowing decoded union to specific config types.
   *
   * @example
   * const config = S.decodeSync(AllowedAttributesFor)("a");
   * if (AllowedAttributesFor.is.a(config)) {
   *   // config is narrowed to { _tag: "a", values: [...] }
   * }
   */
  readonly is: ConfigGuards<Entries>;

  /**
   * Effect HashMap for O(1) immutable lookups from tag to decoded config.
   *
   * @example
   * import { HashMap, Option } from "effect";
   * HashMap.get(AllowedAttributesFor.ConfigMap, "a") // Option.some({ _tag: "a", ... })
   */
  readonly ConfigMap: HashMap.HashMap<ExtractTags<Entries>, DecodedUnion<Entries>>;

  /**
   * Derive a new TaggedValuesKit from a subset of tags.
   *
   * @example
   * const SubsetKit = AllowedAttributesFor.derive("a");
   */
  readonly derive: <Tags extends TagsSubset<Entries>>(
    ...tags: Tags
  ) => ITaggedValuesKit<FilteredEntries<Entries, Tags[number]>>;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Build the configs accessor object from entries.
 * Each config includes the `_tag` field and the `values` array.
 */
const buildConfigs = <Entries extends TaggedValuesEntries>(entries: Entries): ConfigsAccessor<Entries> =>
  F.pipe(
    entries,
    A.map(([tag, values]) => [tag, Object.freeze({ _tag: tag, values })] as const),
    A.reduce({} as ConfigsAccessor<Entries>, (acc, [tag, config]) => ({
      ...acc,
      [tag]: config,
    }))
  );

/**
 * Build the values accessor object from entries.
 * Direct access to values arrays without the `_tag` wrapper.
 */
const buildValuesFor = <Entries extends TaggedValuesEntries>(entries: Entries): ValuesForAccessor<Entries> => {
  return F.pipe(
    entries,
    A.map(([tag, values]) => [tag, values] as const),
    A.reduce({} as ValuesForAccessor<Entries>, (acc, [tag, values]) => ({
      ...acc,
      [tag]: values,
    }))
  );
};

/**
 * Build the LiteralKit accessor object from entries.
 * Each entry becomes an IGenericLiteralKit for oneOf validation.
 */
const buildLiteralKitsFor = <Entries extends TaggedValuesEntries>(entries: Entries): LiteralKitForAccessor<Entries> => {
  return F.pipe(
    entries,
    A.map(([tag, values]) => {
      const kit = makeGenericLiteralKit(values);
      return [tag, kit] as const;
    }),
    A.reduce({} as LiteralKitForAccessor<Entries>, (acc, [tag, kit]) => ({
      ...acc,
      [tag]: kit,
    }))
  );
};

/**
 * Build the tags array from entries.
 */
const buildTags = <Entries extends TaggedValuesEntries>(entries: Entries): TagsArray<Entries> =>
  A.map(entries, ([tag]) => tag) as unknown as TagsArray<Entries>;

/**
 * Build the tags enum from entries.
 */
const buildTagsEnum = <Entries extends TaggedValuesEntries>(entries: Entries): TagsEnum<Entries> => {
  return F.pipe(
    entries,
    A.map(([tag]) => [tag, tag] as const),
    A.reduce({} as TagsEnum<Entries>, (acc, [tag]) => ({
      ...acc,
      [tag]: tag,
    }))
  );
};

/**
 * Build the config lookup map for O(1) decode.
 * Uses intermediate mapped type for better inference, widened to Record for indexing.
 */
const buildConfigMap = <Entries extends TaggedValuesEntries>(entries: Entries): Record<string, DecodedUnion<Entries>> =>
  F.pipe(
    entries,
    A.map(([tag, values]) => [tag, { _tag: tag, values }] as const),
    A.reduce(
      {} as {
        [Tag in ExtractTags<Entries>]: DecodedUnion<Entries>;
      },
      (acc, [tag, config]) => ({
        ...acc,
        [tag]: config,
      })
    )
  );

/**
 * Build type guards for each tag.
 * Each guard narrows a tagged object to the specific config type for that tag.
 */
const buildIsGuards = <Entries extends TaggedValuesEntries>(entries: Entries): ConfigGuards<Entries> => {
  return F.pipe(
    entries,
    A.map(([tag]) => {
      const guard = (value: { readonly _tag: ExtractTags<Entries>[0] }): boolean => P.isTagged(tag)(value);
      return [tag, guard] as const;
    }),
    A.reduce({} as ConfigGuards<Entries>, (acc, [tag, guard]) => ({
      ...acc,
      [tag]: guard,
    }))
  );
};

/**
 * Build an Effect HashMap for O(1) immutable lookups.
 */
const buildHashMap = <Entries extends TaggedValuesEntries>(
  entries: Entries,
  configMap: Record<string, DecodedUnion<Entries>>
): HashMap.HashMap<ExtractTags<Entries>, DecodedUnion<Entries>> =>
  F.pipe(
    entries,
    A.map(([tag]) => [tag, configMap[tag]] as readonly [ExtractTags<Entries>, DecodedUnion<Entries>]),
    HashMap.fromIterable
  );

/**
 * Check if two arrays contain the same elements (order-independent).
 * Used for encode validation (allOf).
 */
const arraysEqual = (a: ReadonlyArray<AST.LiteralValue>, b: ReadonlyArray<AST.LiteralValue>): boolean => {
  if (a.length !== b.length) return false;
  const sortedA = F.pipe(a, A.map(String), A.sort(Order.string));
  const sortedB = F.pipe(b, A.map(String), A.sort(Order.string));
  return F.pipe(
    A.zip(sortedA, sortedB),
    A.every(([x, y]) => x === y)
  );
};

// ============================================================================
// Factory Implementation
// ============================================================================

/**
 * Creates a tagged values kit from entries.
 *
 * @param entries - The tag/values entries
 * @param ast - Optional AST override (used for annotations)
 * @returns A TaggedValuesKit instance
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
export function makeTaggedValuesKit<const Entries extends TaggedValuesEntries>(
  entries: Entries,
  ast?: AST.AST | undefined
): ITaggedValuesKit<Entries> {
  // Build static properties
  const configsAccessor = buildConfigs(entries);
  const valuesForAccessor = buildValuesFor(entries);
  const literalKitsForAccessor = buildLiteralKitsFor(entries);
  const tagsArray = buildTags(entries);
  const tagsEnum = buildTagsEnum(entries);
  const configMap = buildConfigMap(entries);
  const isGuards = buildIsGuards(entries);
  const hashMap = buildHashMap(entries, configMap);

  // Build literal union schema for the "from" side (encoded type)
  // Cast to EntriesToLiteralSchemas<Entries> preserves exact literal types
  // A.map returns array but entries is NonEmptyReadonlyArray, guaranteeing non-empty result
  const literalSchemas = A.map(entries, ([tag]) => S.Literal(tag)) as unknown as EntriesToLiteralSchemas<Entries>;
  const literalUnion = S.Union(...(literalSchemas as SchemaMembers<ExtractTags<Entries>>));

  // Build struct schemas for the "to" side (decoded type)
  // Cast to EntriesToStructSchemas<Entries> preserves exact struct types per entry
  const structSchemas = A.map(entries, ([tag, values]) => {
    // Build tuple schema for exact values array
    const tupleMembers = A.map(values, (v) => S.Literal(v));
    const valuesSchema = S.Tuple(...(tupleMembers as SchemaMembers<AST.LiteralValue>));

    return S.Struct({
      _tag: S.Literal(tag),
      values: valuesSchema,
    });
  }) as unknown as EntriesToStructSchemas<Entries>;
  // S.Union needs SchemaMembers constraint for its signature
  const taggedUnion = S.Union(...(structSchemas as SchemaMembers<DecodedUnion<Entries>>));

  // Create the transform schema
  const transformSchema = S.transform(literalUnion, taggedUnion, {
    strict: true,
    decode: (tag) =>
      F.pipe(
        O.fromNullable(configMap[tag]),
        O.getOrElse(() => {
          throw new TaggedValuesKitDecodeError({
            tag,
            message: `TaggedValuesKit: unexpected tag "${tag}" - this should never happen`,
          });
        })
      ),
    encode: (config) => {
      // Validate that values match exactly (allOf)
      const expectedValues = F.pipe(
        O.fromNullable(configMap[config._tag]),
        O.map((c) => c.values),
        O.getOrElse(() => [] as ReadonlyArray<AST.LiteralValue>)
      );

      if (!arraysEqual(config.values, expectedValues)) {
        throw new TaggedValuesKitEncodeError({
          tag: config._tag,
          expected: expectedValues,
          received: config.values,
          message: `TaggedValuesKit: values for tag "${config._tag}" must match exactly`,
        });
      }

      return config._tag as ExtractTags<Entries>;
    },
  });

  // Use provided AST or extract from transform schema
  const schemaAST = ast ?? transformSchema.ast;

  // Derive function to create subset kits
  const derive = <Tags extends TagsSubset<Entries>>(
    ...tags: Tags
  ): ITaggedValuesKit<FilteredEntries<Entries, Tags[number]>> => {
    const filteredEntries = F.pipe(
      entries,
      A.filter((entry): entry is EntryForTag<Entries, Tags[number]> => A.contains(tags, entry[0]))
    );
    // Type assertion: A.filter can't prove non-emptiness at compile time
    // Runtime guarantee: tags is NonEmptyReadonlyArray and all tags exist in entries
    return makeTaggedValuesKit(filteredEntries as unknown as FilteredEntries<Entries, Tags[number]>);
  };

  return class TaggedValuesKitClass extends S.make<DecodedUnion<Entries>, ExtractTags<Entries>>(schemaAST) {
    static override annotations(annotations: S.Annotations.Schema<DecodedUnion<Entries>>): ITaggedValuesKit<Entries> {
      return makeTaggedValuesKit(entries, mergeSchemaAnnotations(this.ast, annotations));
    }

    static Configs = configsAccessor;
    static ValuesFor = valuesForAccessor;
    static LiteralKitFor = literalKitsForAccessor;
    static Tags = tagsArray;
    static TagsEnum = tagsEnum;
    static Entries = entries;
    static is = isGuards;
    static ConfigMap = hashMap;
    static derive = derive;
  } as UnsafeTypes.UnsafeAny;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Creates a tagged values kit that transforms between string literal tags and tagged value arrays.
 *
 * Provides bidirectional transformation with full type inference, direct values access, and LiteralKit generation.
 *
 * @example
 * import { TaggedValuesKit } from "@beep/schema/derived/kits/tagged-values-kit";
 * import * as S from "effect/Schema";
 *
 * // Define allowed attributes for HTML elements
 * const AllowedAttributesFor = TaggedValuesKit(
 *   ["a", ["charset", "coords", "download", "href", "hreflang", "name", "ping", "referrerpolicy", "rel", "rev", "shape", "target", "type"]],
 *   ["img", ["src", "alt", "width", "height", "loading"]],
 *   ["input", ["type", "name", "value", "placeholder", "required", "disabled"]],
 * );
 *
 * // Direct values access (without _tag wrapper)
 * AllowedAttributesFor.ValuesFor.a     // ["charset", "coords", ...]
 * AllowedAttributesFor.ValuesFor.img   // ["src", "alt", ...]
 *
 * // LiteralKit for oneOf validation of individual values
 * const aAttrKit = AllowedAttributesFor.LiteralKitFor.a;
 * S.decodeSync(aAttrKit)("href")    // "href" (valid)
 * S.decodeSync(aAttrKit)("src")     // throws (not in "a")
 *
 * // Tag utilities
 * AllowedAttributesFor.Tags      // ["a", "img", "input"]
 * AllowedAttributesFor.TagsEnum  // { a: "a", img: "img", input: "input" }
 *
 * // Decode: literal → tagged struct
 * const decoded = S.decodeSync(AllowedAttributesFor)("a");
 * // { _tag: "a", values: ["charset", "coords", ...] }
 *
 * // Encode: tagged struct → literal (validates exact match)
 * const encoded = S.encodeSync(AllowedAttributesFor)(decoded);
 * // "a"
 *
 * @example
 * // Derive a subset kit
 * const LinkAndImageKit = AllowedAttributesFor.derive("a", "img");
 * LinkAndImageKit.Tags  // ["a", "img"]
 *
 * @example
 * // Supports any literal value types
 * const NumericGroupsKit = TaggedValuesKit(
 *   ["evens", [2, 4, 6, 8, 10]],
 *   ["odds", [1, 3, 5, 7, 9]],
 *   ["primes", [2, 3, 5, 7, 11]],
 * );
 *
 * NumericGroupsKit.ValuesFor.primes  // [2, 3, 5, 7, 11]
 * S.decodeSync(NumericGroupsKit.LiteralKitFor.primes)(5)  // 5 (valid)
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export function TaggedValuesKit<const Entries extends TaggedValuesEntries>(
  ...entries: Entries
): ITaggedValuesKit<Entries> {
  // Build decoded configs for arbitrary generation
  // Each entry produces a DecodedConfig: { _tag, values }
  const configValues: DecodedUnion<Entries>[] = F.pipe(
    entries,
    A.map(([tag, values]) => ({ _tag: tag, values }) as DecodedUnion<Entries>)
  );

  return makeTaggedValuesKit(entries).annotations({
    description: "Bidirectional transformation between string literal tags and tagged value arrays",
    arbitrary: () => (fc) => fc.constantFrom(...configValues),
  });
}

// ============================================================================
// Object Helper
// ============================================================================

/**
 * Creates a TaggedValuesKit from an object map.
 *
 * Convenience helper for converting existing value maps to TaggedValuesKit.
 *
 * @example
 * import { TaggedValuesKitFromObject } from "@beep/schema/derived/kits/tagged-values-kit";
 *
 * const ALLOWED_ATTRIBUTES = {
 *   a: ["charset", "coords", "download", "href", "hreflang"],
 *   img: ["src", "alt", "width", "height", "loading"],
 * } as const;
 *
 * const AllowedAttributesFor = TaggedValuesKitFromObject(ALLOWED_ATTRIBUTES);
 *
 * // Same API as TaggedValuesKit
 * AllowedAttributesFor.ValuesFor.a       // ["charset", "coords", ...]
 * AllowedAttributesFor.LiteralKitFor.a   // IGenericLiteralKit
 * AllowedAttributesFor.Tags              // ["a", "img"]
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export const TaggedValuesKitFromObject = <const Obj extends Record<string, A.NonEmptyReadonlyArray<AST.LiteralValue>>>(
  obj: Obj
): ITaggedValuesKit<
  A.NonEmptyReadonlyArray<
    {
      readonly [K in keyof Obj & string]: readonly [K, Obj[K]];
    }[keyof Obj & string]
  >
> => {
  const keys = Struct.keys(obj);
  const entries = A.map(keys, (key) => [key, obj[key]] as const);

  return TaggedValuesKit(...(entries as unknown as TaggedValuesEntries)) as UnsafeTypes.UnsafeAny;
};
