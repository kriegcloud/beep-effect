/**
 * Tagged config kit that transforms string literal keys to tagged configuration structs.
 *
 * Provides bidirectional transformation where:
 * - Decode: `"GRAY"` → `{ _tag: "GRAY", textColor: '#FFFFFF', backgroundColor: '#202020' }`
 * - Encode: `{ _tag: "GRAY", ... }` → `"GRAY"`
 *
 * @example
 * import { TaggedConfigKit } from "@beep/schema/derived/kits/tagged-config-kit";
 *
 * const LabelColor = TaggedConfigKit(
 *   ["GRAY", { textColor: '#FFFFFF', backgroundColor: '#202020' }],
 *   ["GREEN", { textColor: '#D1F0D9', backgroundColor: '#12341D' }],
 * );
 *
 * // Direct config access
 * LabelColor.Configs.GRAY // { _tag: "GRAY", textColor: '#FFFFFF', backgroundColor: '#202020' }
 *
 * // Tag utilities
 * LabelColor.Tags      // ["GRAY", "GREEN"]
 * LabelColor.TagsEnum  // { GRAY: "GRAY", GREEN: "GREEN" }
 *
 * // Decode: literal → tagged struct
 * import * as S from "effect/Schema";
 * S.decodeSync(LabelColor)("GRAY")  // { _tag: "GRAY", textColor: '#FFFFFF', ... }
 *
 * // Encode: tagged struct → literal
 * S.encodeSync(LabelColor)({ _tag: "GRAY", ... })  // "GRAY"
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
import * as R from "effect/Record";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import * as Struct from "effect/Struct";
import { mergeSchemaAnnotations } from "../../core/annotations/built-in-annotations";

/**
 * Error thrown when an unexpected tag is encountered during decode.
 * This should never happen since tags are validated by the literal union schema.
 *
 * @since 0.1.0
 * @category Errors
 */
export class TaggedConfigKitDecodeError extends Data.TaggedError("TaggedConfigKitDecodeError")<{
  readonly tag: string;
  readonly message: string;
}> {}

// ============================================================================
// Type Utilities
// ============================================================================

/**
 * Config value constraint - supports any AST.LiteralValue.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type ConfigValue = AST.LiteralValue;

/**
 * Config object type - flat object with literal values.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type ConfigObject = Record<string, ConfigValue>;

/**
 * Single entry type: [tag, config].
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type TaggedConfigEntry = readonly [string, ConfigObject];

/**
 * Entries array type - non-empty readonly array of entries.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type TaggedConfigEntries = A.NonEmptyReadonlyArray<TaggedConfigEntry>;

/**
 * Extract tag literals from entries as a union type.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type ExtractTags<E extends TaggedConfigEntries> = E[number][0];

/**
 * Build a decoded config type from tag and config.
 * Adds `_tag` field and preserves literal types for config values.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type DecodedConfig<Tag extends string, Config extends ConfigObject> = {
  readonly _tag: Tag;
} & {
  readonly [K in keyof Config]: Config[K];
};

/**
 * Build the decoded union type from entries.
 * Each entry becomes a discriminated struct with `_tag` field.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type DecodedUnion<E extends TaggedConfigEntries> = E[number] extends readonly [
  infer T extends string,
  infer C extends ConfigObject,
]
  ? DecodedConfig<T, C>
  : never;

/**
 * Tags array type - tuple of all tag strings.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type TagsArray<E extends TaggedConfigEntries> = {
  readonly [K in keyof E]: E[K] extends readonly [infer T extends string, ConfigObject] ? T : never;
};

/**
 * Tags enum type - maps tag strings to themselves.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type TagsEnum<E extends TaggedConfigEntries> = {
  readonly [Entry in E[number] as Entry[0]]: Entry[0];
};

/**
 * Configs accessor type - maps tag strings to their decoded config structs.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type ConfigsAccessor<E extends TaggedConfigEntries> = {
  readonly [Entry in E[number] as Entry[0]]: DecodedConfig<Entry[0], Entry[1]>;
};

/**
 * Type guard map: one guard per tag.
 *
 * Maps each tag string to a type guard function that narrows a value to that specific config.
 * Uses a simpler type predicate that TypeScript can verify.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type ConfigGuards<E extends TaggedConfigEntries> = {
  readonly [Entry in E[number] as Entry[0]]: (value: {
    readonly _tag: string;
  }) => value is DecodedConfig<Entry[0], Entry[1]>;
};

/**
 * Subset of tags from a parent entries type.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type TagsSubset<E extends TaggedConfigEntries> = A.NonEmptyReadonlyArray<ExtractTags<E>>;

// ============================================================================
// Interface
// ============================================================================

/**
 * Interface representing a tagged config kit instance.
 *
 * Combines transform schema functionality with direct config access.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
export interface ITaggedConfigKit<Entries extends TaggedConfigEntries>
  extends S.AnnotableClass<ITaggedConfigKit<Entries>, DecodedUnion<Entries>, ExtractTags<Entries>> {
  /**
   * Direct access to config structs by tag.
   *
   * @example
   * LabelColor.Configs.GRAY // { _tag: "GRAY", textColor: '#FFFFFF', ... }
   */
  readonly Configs: ConfigsAccessor<Entries>;

  /**
   * Array of all tags (like StringLiteralKit.Options).
   *
   * @example
   * LabelColor.Tags // ["GRAY", "GREEN"]
   */
  readonly Tags: TagsArray<Entries>;

  /**
   * Enum-like accessor for tags.
   *
   * @example
   * LabelColor.TagsEnum.GRAY // "GRAY"
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
   * const config = S.decodeSync(LabelColor)("GRAY");
   * if (LabelColor.is.GRAY(config)) {
   *   // config is narrowed to { _tag: "GRAY", textColor: '#FFFFFF', backgroundColor: '#202020' }
   * }
   */
  readonly is: ConfigGuards<Entries>;

  /**
   * Effect HashMap for O(1) immutable lookups from tag to decoded config.
   *
   * @example
   * import { HashMap, Option } from "effect";
   * HashMap.get(LabelColor.ConfigMap, "GRAY") // Option.some({ _tag: "GRAY", ... })
   */
  readonly ConfigMap: HashMap.HashMap<ExtractTags<Entries>, DecodedUnion<Entries>>;

  /**
   * Derive a new TaggedConfigKit from a subset of tags.
   *
   * @example
   * const PrimaryColors = LabelColor.derive("RED", "GREEN", "BLUE");
   */
  readonly derive: <Tags extends TagsSubset<Entries>>(
    ...tags: Tags
  ) => ITaggedConfigKit<A.NonEmptyReadonlyArray<Entries[number] & readonly [Tags[number], ConfigObject]>>;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Build the configs accessor object from entries.
 * Each config is frozen for safety and includes the `_tag` field.
 */
const buildConfigs = <Entries extends TaggedConfigEntries>(entries: Entries): ConfigsAccessor<Entries> => {
  const configEntries = F.pipe(
    entries,
    A.map(([tag, config]) => {
      const fullConfig = Object.freeze({ _tag: tag, ...config });
      return [tag, fullConfig] as const;
    })
  );
  return R.fromEntries(configEntries) as unknown as ConfigsAccessor<Entries>;
};

/**
 * Build the tags array from entries.
 */
const buildTags = <Entries extends TaggedConfigEntries>(entries: Entries): TagsArray<Entries> =>
  A.map(entries, ([tag]) => tag) as unknown as TagsArray<Entries>;

/**
 * Build the tags enum from entries.
 */
const buildTagsEnum = <Entries extends TaggedConfigEntries>(entries: Entries): TagsEnum<Entries> => {
  const enumEntries = F.pipe(
    entries,
    A.map(([tag]) => [tag, tag] as const)
  );
  return R.fromEntries(enumEntries) as unknown as TagsEnum<Entries>;
};

/**
 * Build the config lookup map for O(1) decode.
 */
const buildConfigMap = <Entries extends TaggedConfigEntries>(
  entries: Entries
): Record<string, DecodedUnion<Entries>> => {
  const mapEntries = F.pipe(
    entries,
    A.map(([tag, config]) => [tag, { _tag: tag, ...config }] as const)
  );
  return R.fromEntries(mapEntries) as unknown as Record<string, DecodedUnion<Entries>>;
};

/**
 * Build type guards for each tag.
 * Each guard narrows a tagged object to the specific config type for that tag.
 */
const buildIsGuards = <Entries extends TaggedConfigEntries>(entries: Entries): ConfigGuards<Entries> => {
  const guardEntries = F.pipe(
    entries,
    A.map(([tag]) => {
      // Use a broader input type that TypeScript can verify
      const guard = (value: { readonly _tag: string }): boolean => value._tag === tag;
      return [tag, guard] as const;
    })
  );
  return R.fromEntries(guardEntries) as unknown as ConfigGuards<Entries>;
};

/**
 * Build an Effect HashMap for O(1) immutable lookups.
 */
const buildHashMap = <Entries extends TaggedConfigEntries>(
  entries: Entries,
  configMap: Record<string, DecodedUnion<Entries>>
): HashMap.HashMap<ExtractTags<Entries>, DecodedUnion<Entries>> =>
  F.pipe(
    entries,
    A.map(([tag]) => [tag, configMap[tag]] as readonly [ExtractTags<Entries>, DecodedUnion<Entries>]),
    HashMap.fromIterable
  );

// ============================================================================
// Factory Implementation
// ============================================================================

/**
 * Creates a tagged config kit from entries.
 *
 * @param entries - The tag/config entries
 * @param ast - Optional AST override (used for annotations)
 * @returns A TaggedConfigKit instance
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
export function makeTaggedConfigKit<const Entries extends TaggedConfigEntries>(
  entries: Entries,
  ast?: AST.AST | undefined
): ITaggedConfigKit<Entries> {
  // Build static properties
  const configsAccessor = buildConfigs(entries);
  const tagsArray = buildTags(entries);
  const tagsEnum = buildTagsEnum(entries);
  const configMap = buildConfigMap(entries);
  const isGuards = buildIsGuards(entries);
  const hashMap = buildHashMap(entries, configMap);

  // Build literal union schema for the "from" side (encoded type)
  const literalSchemas = A.map(entries, ([tag]) => S.Literal(tag));
  const literalUnion = S.Union(...(literalSchemas as [S.Schema<string>, ...S.Schema<string>[]]));

  // Build struct schemas for the "to" side (decoded type)
  // Use S.Literal for each config value to preserve exact literal types
  const structSchemas = A.map(entries, ([tag, config]) => {
    const configFields = F.pipe(
      Struct.keys(config),
      A.map((key) => [key, S.Literal(config[key] as ConfigValue)] as const),
      R.fromEntries
    );
    return S.Struct({
      _tag: S.Literal(tag),
      ...configFields,
    });
  });
  const taggedUnion = S.Union(
    ...(structSchemas as [S.Schema<UnsafeTypes.UnsafeAny>, ...S.Schema<UnsafeTypes.UnsafeAny>[]])
  );

  // Create the transform schema
  // The decode function is safe because:
  // 1. `tag` is validated by `literalUnion` schema to be a valid tag
  // 2. `configMap` is built from the same `entries`, so all valid tags exist
  // We use Option.getOrElse with a throw for a descriptive error
  const transformSchema = S.transform(literalUnion, taggedUnion, {
    strict: true,
    decode: (tag) =>
      F.pipe(
        O.fromNullable(configMap[tag]),
        O.getOrElse(() => {
          // This should never happen since the tag is validated by literalUnion
          throw new TaggedConfigKitDecodeError({
            tag,
            message: `TaggedConfigKit: unexpected tag "${tag}" - this should never happen`,
          });
        })
      ),
    encode: (config) => config._tag as ExtractTags<Entries>,
  });

  // Use provided AST or extract from transform schema
  const schemaAST = ast ?? transformSchema.ast;

  // Derive function to create subset kits
  const derive = <Tags extends TagsSubset<Entries>>(
    ...tags: Tags
  ): ITaggedConfigKit<A.NonEmptyReadonlyArray<Entries[number] & readonly [Tags[number], ConfigObject]>> => {
    const filteredEntries = F.pipe(
      entries,
      A.filter(([tag]) => A.contains(tags, tag))
    ) as unknown as A.NonEmptyReadonlyArray<Entries[number] & readonly [Tags[number], ConfigObject]>;
    return makeTaggedConfigKit(filteredEntries);
  };

  return class TaggedConfigKitClass extends S.make<DecodedUnion<Entries>, ExtractTags<Entries>>(schemaAST) {
    static override annotations(annotations: S.Annotations.Schema<DecodedUnion<Entries>>): ITaggedConfigKit<Entries> {
      return makeTaggedConfigKit(entries, mergeSchemaAnnotations(this.ast, annotations));
    }

    static Configs = configsAccessor;
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
 * Creates a tagged config kit that transforms between string literal tags and tagged config structs.
 *
 * Provides bidirectional transformation with full type inference and static config access.
 *
 * @example
 * import { TaggedConfigKit } from "@beep/schema/derived/kits/tagged-config-kit";
 * import * as S from "effect/Schema";
 *
 * // Define label colors with their configurations
 * const LabelColor = TaggedConfigKit(
 *   ["GRAY", { textColor: '#FFFFFF', backgroundColor: '#202020' }],
 *   ["GREEN", { textColor: '#D1F0D9', backgroundColor: '#12341D' }],
 *   ["BLUE", { textColor: '#B3D9FF', backgroundColor: '#0A3D6E' }],
 * );
 *
 * // Direct config access with full type inference
 * const grayConfig = LabelColor.Configs.GRAY;
 * // { _tag: "GRAY", textColor: '#FFFFFF', backgroundColor: '#202020' }
 *
 * // Tag utilities
 * LabelColor.Tags      // ["GRAY", "GREEN", "BLUE"]
 * LabelColor.TagsEnum  // { GRAY: "GRAY", GREEN: "GREEN", BLUE: "BLUE" }
 *
 * // Decode: literal → tagged struct
 * const decoded = S.decodeSync(LabelColor)("GRAY");
 * // { _tag: "GRAY", textColor: '#FFFFFF', backgroundColor: '#202020' }
 *
 * // Encode: tagged struct → literal
 * const encoded = S.encodeSync(LabelColor)(decoded);
 * // "GRAY"
 *
 * @example
 * // Supports different value types (string, number, boolean)
 * const Priority = TaggedConfigKit(
 *   ["LOW", { level: 1, urgent: false, color: "gray" }],
 *   ["MEDIUM", { level: 2, urgent: false, color: "yellow" }],
 *   ["HIGH", { level: 3, urgent: true, color: "red" }],
 * );
 *
 * Priority.Configs.HIGH.level   // 3
 * Priority.Configs.HIGH.urgent  // true
 *
 * @example
 * // Empty config (just _tag) is supported
 * const SimpleStatus = TaggedConfigKit(
 *   ["ACTIVE", {}],
 *   ["INACTIVE", {}],
 * );
 * // Decoded type: { _tag: "ACTIVE" } | { _tag: "INACTIVE" }
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export function TaggedConfigKit<const Entries extends TaggedConfigEntries>(
  ...entries: Entries
): ITaggedConfigKit<Entries> {
  // Build configs for arbitrary generation
  const configs = buildConfigs(entries);
  const configValues = F.pipe(
    Struct.keys(configs),
    A.map((key) => configs[key as keyof typeof configs])
  ) as DecodedUnion<Entries>[];

  return makeTaggedConfigKit(entries).annotations({
    description: "Bidirectional transformation between string literal tags and tagged config structs",
    arbitrary: () => (fc) => fc.constantFrom(...configValues),
  });
}

// ============================================================================
// Object Helper
// ============================================================================

/**
 * Creates a TaggedConfigKit from an object map.
 *
 * Convenience helper for converting existing config objects to TaggedConfigKit.
 *
 * @example
 * import { TaggedConfigKitFromObject } from "@beep/schema/derived/kits/tagged-config-kit";
 *
 * const LABEL_COLORS = {
 *   GRAY: { textColor: '#FFFFFF', backgroundColor: '#202020' },
 *   GREEN: { textColor: '#D1F0D9', backgroundColor: '#12341D' },
 * } as const;
 *
 * const LabelColor = TaggedConfigKitFromObject(LABEL_COLORS);
 *
 * // Same API as TaggedConfigKit
 * LabelColor.Configs.GRAY  // { _tag: "GRAY", textColor: '#FFFFFF', ... }
 * LabelColor.Tags          // ["GRAY", "GREEN"]
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export const TaggedConfigKitFromObject = <const Obj extends Record<string, ConfigObject>>(
  obj: Obj
): ITaggedConfigKit<
  A.NonEmptyReadonlyArray<
    {
      readonly [K in keyof Obj & string]: readonly [K, Obj[K]];
    }[keyof Obj & string]
  >
> => {
  const keys = Struct.keys(obj);
  const entries = A.map(keys, (key) => [key, obj[key]] as const);

  return TaggedConfigKit(...(entries as unknown as TaggedConfigEntries)) as UnsafeTypes.UnsafeAny;
};
