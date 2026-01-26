/**
 * Tag filtering for sanitize-html
 *
 * @since 0.1.0
 * @module
 */

import { thunkFalse, thunkTrue, thunkUndefined } from "@beep/utils/thunk";
import * as A from "effect/Array";
import * as Match from "effect/Match";
import * as P from "effect/Predicate";
import * as Str from "effect/String";

/**
 * Vulnerable tags that can execute arbitrary code
 * @internal
 */
const VULNERABLE_TAGS = ["script", "style"] as const;

/**
 * Media-related tags
 * @internal
 */
const MEDIA_TAGS = ["img", "audio", "video", "picture", "svg", "object", "map", "iframe", "embed"] as const;

/**
 * Helper to check if a normalized tag name exists in a tag list
 * @internal
 */
const tagExistsIn = (normalizedTag: string, tags: readonly string[]): boolean =>
  A.some(tags, (tag) => Str.toLowerCase(tag) === normalizedTag);

/**
 * Check if a tag is allowed based on the allowedTags configuration.
 *
 * @example
 * ```typescript
 * import { isTagAllowed } from "@beep/utils/sanitize-html/filters/tag-filter"
 *
 * isTagAllowed("div", ["div", "p", "span"]) // true
 * isTagAllowed("script", ["div", "p", "span"]) // false
 * isTagAllowed("div", false) // true (false means allow all)
 * ```
 *
 * @since 0.1.0
 * @category filtering
 */
export const isTagAllowed = (tagName: string, allowedTags: false | readonly string[] | undefined): boolean =>
  Match.value(allowedTags).pipe(
    // false means allow all tags
    Match.when(false, thunkTrue),
    // undefined means allow nothing
    Match.when(P.isUndefined, thunkFalse),
    // Array means check if tag is in the list
    Match.when(A.isArray, (tags) => {
      const normalizedTag = Str.toLowerCase(tagName);
      return tagExistsIn(normalizedTag, tags);
    }),
    // Any other value (non-array, non-false, non-undefined) means disallow
    Match.orElse(thunkFalse)
  );

/**
 * Check if a tag is a self-closing (void) element.
 *
 * @example
 * ```typescript
 * import { isSelfClosingTag } from "@beep/utils/sanitize-html/filters/tag-filter"
 *
 * isSelfClosingTag("br", ["br", "hr", "img"]) // true
 * isSelfClosingTag("div", ["br", "hr", "img"]) // false
 * ```
 *
 * @since 0.1.0
 * @category guards
 */
export const isSelfClosingTag = (tagName: string, selfClosing: readonly string[]): boolean => {
  const normalizedTag = Str.toLowerCase(tagName);
  return tagExistsIn(normalizedTag, selfClosing);
};

/**
 * Check if a tag is a vulnerable tag (script, style).
 *
 * @example
 * ```typescript
 * import { isVulnerableTag } from "@beep/utils/sanitize-html/filters/tag-filter"
 *
 * isVulnerableTag("script") // true
 * isVulnerableTag("style") // true
 * isVulnerableTag("div") // false
 * ```
 *
 * @since 0.1.0
 * @category guards
 */
export const isVulnerableTag = (tagName: string): boolean => {
  const normalizedTag = Str.toLowerCase(tagName);
  return A.some(VULNERABLE_TAGS, (tag) => tag === normalizedTag);
};

/**
 * Check if a tag is a non-text tag (content should not be parsed as HTML).
 *
 * @example
 * ```typescript
 * import { isNonTextTag } from "@beep/utils/sanitize-html/filters/tag-filter"
 *
 * isNonTextTag("script", ["script", "style", "textarea"]) // true
 * isNonTextTag("div", ["script", "style", "textarea"]) // false
 * ```
 *
 * @since 0.1.0
 * @category guards
 */
export const isNonTextTag = (tagName: string, nonTextTags: readonly string[]): boolean => {
  const normalizedTag = Str.toLowerCase(tagName);
  return tagExistsIn(normalizedTag, nonTextTags);
};

/**
 * Check if a tag is a media tag (img, video, audio, etc.).
 *
 * @example
 * ```typescript
 * import { isMediaTag } from "@beep/utils/sanitize-html/filters/tag-filter"
 *
 * isMediaTag("img") // true
 * isMediaTag("video") // true
 * isMediaTag("div") // false
 * ```
 *
 * @since 0.1.0
 * @category guards
 */
export const isMediaTag = (tagName: string): boolean => {
  const normalizedTag = Str.toLowerCase(tagName);
  return A.some(MEDIA_TAGS, (tag) => tag === normalizedTag);
};

/**
 * Warn about vulnerable tags if they are allowed without explicit opt-in.
 *
 * @since 0.1.0
 * @category utilities
 */
export const warnAboutVulnerableTags = (
  allowedTags: false | readonly string[] | undefined,
  allowVulnerableTags: boolean | undefined
): void =>
  Match.value({ allowedTags, allowVulnerableTags }).pipe(
    // If vulnerable tags are explicitly allowed, do nothing
    Match.when({ allowVulnerableTags: true }, thunkUndefined),
    // If all tags allowed (false), user is responsible
    Match.when({ allowedTags: false }, thunkUndefined),
    // If undefined or not an array, do nothing
    Match.when(({ allowedTags }) => P.isUndefined(allowedTags) || !A.isArray(allowedTags), thunkUndefined),
    // Check for vulnerable tags in the allowed list
    Match.orElse(({ allowedTags }) => {
      // At this point, allowedTags is guaranteed to be a readonly string array
      const tags = allowedTags as readonly string[];
      A.forEach(VULNERABLE_TAGS, (tag) => {
        Match.value(isTagAllowed(tag, tags)).pipe(
          Match.when(true, () => {
            console.warn(
              `\n\n⚠️ Your \`allowedTags\` option includes, \`${tag}\`, which is inherently\n` +
                `vulnerable to XSS attacks. Please remove it from \`allowedTags\`.\n` +
                `Or, to disable this warning, add the \`allowVulnerableTags\` option\n` +
                `and ensure you are accounting for this risk.\n\n`
            );
          }),
          Match.orElse(thunkUndefined)
        );
      });
    })
  );
