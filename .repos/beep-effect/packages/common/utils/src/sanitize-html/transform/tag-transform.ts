/**
 * Tag transformation for sanitize-html
 *
 * @since 0.1.0
 * @module
 */

import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Str from "effect/String";

import type { Attributes, TransformedTag, Transformer } from "../types";

/**
 * Transform configuration.
 * Maps tag names (or "*" for all tags) to transformers.
 */
export type TransformTags = Record<string, string | Transformer>;

/**
 * Simple transform that replaces tag name and optionally merges attributes.
 *
 * @example
 * ```typescript
 * import { simpleTransform } from "@beep/utils/sanitize-html/transform/tag-transform"
 *
 * const transform = simpleTransform("ul", { class: "list" })
 * transform("ol", { id: "nav" })
 * // { tagName: "ul", attribs: { id: "nav", class: "list" } }
 *
 * const replaceAll = simpleTransform("ul", { class: "list" }, false)
 * replaceAll("ol", { id: "nav" })
 * // { tagName: "ul", attribs: { class: "list" } }
 * ```
 *
 * @since 0.1.0
 * @category transformers
 */
export const simpleTransform = (newTagName: string, newAttribs: Attributes = {}, merge = true): Transformer => {
  return (_tagName: string, attribs: Attributes): TransformedTag =>
    Match.value(merge).pipe(
      Match.when(true, () => ({
        tagName: newTagName,
        attribs: { ...attribs, ...newAttribs },
      })),
      Match.when(false, () => ({
        tagName: newTagName,
        attribs: newAttribs,
      })),
      Match.exhaustive
    );
};

/**
 * Create a transformer from a string or function.
 */
const createTransformer = (transform: string | Transformer): Transformer =>
  Match.value(transform).pipe(
    Match.when(P.isString, (str) => simpleTransform(str)),
    Match.orElse((fn) => fn)
  );

/**
 * Get the transformer for a tag.
 */
const getTransformer = (tagName: string, transformTags: TransformTags): O.Option<Transformer> =>
  F.pipe(
    tagName,
    Str.toLowerCase,
    (normalizedTag) =>
      F.pipe(
        R.get(transformTags, normalizedTag),
        O.orElse(() => R.get(transformTags, "*"))
      ),
    O.map(createTransformer)
  );

/**
 * Transform a tag using the configured transformers.
 *
 * @example
 * ```typescript
 * import { transformTag } from "@beep/utils/sanitize-html/transform/tag-transform"
 *
 * transformTag("ol", { class: "nav" }, {
 *   ol: "ul"
 * })
 * // Some({ tagName: "ul", attribs: { class: "nav" } })
 *
 * transformTag("div", {}, {
 *   "*": (tag, attrs) => ({ tagName: tag, attribs: { ...attrs, "data-processed": "true" } })
 * })
 * // Some({ tagName: "div", attribs: { "data-processed": "true" } })
 *
 * transformTag("div", {}, {})
 * // None
 * ```
 *
 * @since 0.1.0
 * @category transformation
 */
export const transformTag = (
  tagName: string,
  attribs: Attributes,
  transformTags: TransformTags | undefined
): O.Option<TransformedTag> =>
  F.pipe(
    O.fromNullable(transformTags),
    O.flatMap((tags) => getTransformer(tagName, tags)),
    O.map((transformer) => transformer(tagName, attribs))
  );

/**
 * Apply tag transformation and return the result or original values.
 *
 * @since 0.1.0
 * @category transformation
 */
export const applyTransform = (
  tagName: string,
  attribs: Attributes,
  transformTags: TransformTags | undefined
): TransformedTag =>
  F.pipe(
    transformTag(tagName, attribs, transformTags),
    O.getOrElse(() => ({
      tagName,
      attribs,
    }))
  );
