/**
 * Tagged union builder that creates a union of tagged structs from shared fields.
 *
 * Given an array of tag literals and a shared fields object, produces a union schema
 * where each member is a `TaggedStruct` with the corresponding tag and shared fields.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { TaggedUnionWith } from "@beep/schema/core/generics/tagged-union-with";
 *
 * const flowOptionsFields = {
 *   expandSubgardens: S.optional(S.Boolean),
 *   animateEdges: S.optional(S.Boolean),
 * };
 *
 * const FlowOptions = TaggedUnionWith({
 *   tags: ["default", "straight", "step", "smoothstep", "simplebezier"],
 *   fields: flowOptionsFields,
 * });
 *
 * // Equivalent to:
 * // S.Union(
 * //   S.TaggedStruct("default", flowOptionsFields),
 * //   S.TaggedStruct("straight", flowOptionsFields),
 * //   S.TaggedStruct("step", flowOptionsFields),
 * //   S.TaggedStruct("smoothstep", flowOptionsFields),
 * //   S.TaggedStruct("simplebezier", flowOptionsFields)
 * // )
 *
 * @category Core/Generics
 * @since 0.1.0
 */

import { $SchemaId } from "@beep/identity/packages";
import type { StringTypes, StructTypes } from "@beep/types";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import type { DefaultAnnotations } from "../annotations/default";

const $I = $SchemaId.create("core/generics/tagged-union-with");

/**
 * Namespace bundling tagged union with shared fields schema and runtime types.
 *
 * @category Core/Generics
 * @since 0.1.0
 */
export declare namespace TaggedUnionWith {
  /**
   * Configuration for creating a tagged union with shared fields.
   * Requires at least 2 tags since a union with 1 member is not a union.
   *
   * @category Core/Generics
   * @since 0.1.0
   */
  export interface Config<
    Tags extends readonly [string, string, ...ReadonlyArray<string>],
    Fields extends StructTypes.StructFieldsWithStringKeys,
  > {
    readonly tags: Tags;
    readonly fields: Fields;
  }

  /**
   * Builds the union member schema type for a single tag.
   *
   * @category Core/Generics
   * @since 0.1.0
   */
  export type MemberSchema<Tag extends string, Fields extends StructTypes.StructFieldsWithStringKeys> = S.TaggedStruct<
    Tag,
    Fields
  >;

  /**
   * Builds the full union schema type from tags and fields.
   *
   * @category Core/Generics
   * @since 0.1.0
   */
  export type Schema<
    Tags extends readonly [string, string, ...ReadonlyArray<string>],
    Fields extends StructTypes.StructFieldsWithStringKeys,
  > = S.Union<TaggedStructTuple<Tags, Fields>>;

  /**
   * Converts a tuple of tag literals into a tuple of TaggedStruct schemas.
   *
   * @category Core/Generics
   * @since 0.1.0
   */
  export type TaggedStructTuple<
    Tags extends readonly string[],
    Fields extends StructTypes.StructFieldsWithStringKeys,
  > = Tags extends readonly [infer First extends string, ...infer Rest extends readonly string[]]
    ? [MemberSchema<First, Fields>, ...TaggedStructTuple<Rest, Fields>]
    : [];

  /**
   * Runtime type of a tagged union with shared fields.
   *
   * @category Core/Generics
   * @since 0.1.0
   */
  export type Type<
    Tags extends readonly [string, string, ...ReadonlyArray<string>],
    Fields extends StructTypes.StructFieldsWithStringKeys,
  > = S.Schema.Type<Schema<Tags, Fields>>;

  /**
   * Encoded type of a tagged union with shared fields.
   *
   * @category Core/Generics
   * @since 0.1.0
   */
  export type Encoded<
    Tags extends readonly [string, string, ...ReadonlyArray<string>],
    Fields extends StructTypes.StructFieldsWithStringKeys,
  > = S.Schema.Encoded<Schema<Tags, Fields>>;
}

/**
 * Creates a union schema from a tuple of tag literals and shared fields.
 *
 * Each member of the union is a `TaggedStruct` with the corresponding tag literal
 * and the shared fields. This is useful when you have multiple variants that share
 * the same structure but differ only in their discriminator tag.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { TaggedUnionWith } from "@beep/schema/core/generics/tagged-union-with";
 *
 * const FlowOptions = TaggedUnionWith({
 *   tags: ["default", "straight", "step"],
 *   fields: {
 *     expandSubgardens: S.optional(S.Boolean),
 *     animateEdges: S.optional(S.Boolean),
 *   },
 * });
 *
 * // Type: { _tag: "default", ... } | { _tag: "straight", ... } | { _tag: "step", ... }
 *
 * @category Core/Generics
 * @since 0.1.0
 */
export const TaggedUnionWith = <
  const Tags extends readonly [
    StringTypes.NonEmptyString<string>,
    StringTypes.NonEmptyString<string>,
    ...ReadonlyArray<StringTypes.NonEmptyString<string>>,
  ],
  const Fields extends StructTypes.StructFieldsWithStringKeys,
>(
  config: TaggedUnionWith.Config<Tags, Fields>
) => {
  const members = F.pipe(
    config.tags,
    A.map((tag) => S.TaggedStruct(tag, config.fields))
  ) as unknown as TaggedUnionWith.TaggedStructTuple<Tags, Fields>;

  const [first, second, ...rest] = members;

  // S.Union requires at least 2 members
  const schema = S.Union(first, second, ...rest);

  return schema.annotations(
    $I.annotations("TaggedUnionWith", {
      description: `Tagged union with variants: ${A.join(config.tags, ", ")}`,
    })
  ) as TaggedUnionWith.Schema<Tags, Fields>;
};

/**
 * Creates a tagged union with shared fields and custom annotations.
 *
 * This variant allows passing additional annotations to the resulting union schema.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { TaggedUnionWithAnnotated } from "@beep/schema/core/generics/tagged-union-with";
 *
 * const FlowOptions = TaggedUnionWithAnnotated(
 *   {
 *     tags: ["default", "straight", "step"],
 *     fields: { animateEdges: S.optional(S.Boolean) },
 *   },
 *   { title: "Flow Options", description: "Configuration for flow visualization" }
 * );
 *
 * @category Core/Generics
 * @since 0.1.0
 */
export const TaggedUnionWithAnnotated = <
  const Tags extends readonly [
    StringTypes.NonEmptyString<string>,
    StringTypes.NonEmptyString<string>,
    ...ReadonlyArray<StringTypes.NonEmptyString<string>>,
  ],
  const Fields extends StructTypes.StructFieldsWithStringKeys,
>(
  config: TaggedUnionWith.Config<Tags, Fields>,
  annotations: DefaultAnnotations<TaggedUnionWith.Type<Tags, Fields>>
): TaggedUnionWith.Schema<Tags, Fields> => {
  return TaggedUnionWith(config).annotations(annotations) as TaggedUnionWith.Schema<Tags, Fields>;
};
