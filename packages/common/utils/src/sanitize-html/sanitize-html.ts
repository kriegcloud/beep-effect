/**
 * Main HTML sanitization function
 *
 * @since 0.1.0
 * @module
 */

import { thunkFalse, thunkTrue } from "@beep/utils/thunk";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import { filterStyles } from "./css/css-filter";
import { defaultAllowedEmptyAttributes, defaultParserOptions, defaults } from "./defaults";
import { filterAttributes, isValidAttributeName } from "./filters/attribute-filter";
import { filterClasses } from "./filters/class-filter";
import {
  isMediaTag,
  isNonTextTag,
  isSelfClosingTag,
  isTagAllowed,
  warnAboutVulnerableTags,
} from "./filters/tag-filter";
import { encodeHtml } from "./parser/entities";
import { parseHtml } from "./parser/html-parser";
import { matchToken, type StartTagToken } from "./parser/token";
import { applyTransform, simpleTransform } from "./transform/tag-transform";
import type { Attributes, Frame, MergedSanitizeOptions, SanitizeOptions } from "./types";
import { filterSrcset } from "./url/srcset-parser";
import { isNaughtyHref, validateIframeSrc, validateScriptSrc } from "./url/url-validator";

/**
 * Internal frame for tracking parser state.
 */
interface InternalFrame {
  tag: string;
  attribs: Attributes;
  text: string;
  tagPosition: number;
  mediaChildren: string[];
  openingTagLength: number;
  innerText?: undefined | string;
}

/**
 * Merge options with defaults.
 */
const mergeOptions = (options: SanitizeOptions | undefined): MergedSanitizeOptions => {
  const opts = options ?? {};

  return {
    allowedTags: opts.allowedTags ?? defaults.allowedTags,
    allowedAttributes: opts.allowedAttributes ?? defaults.allowedAttributes,
    allowedStyles: opts.allowedStyles,
    allowedClasses: opts.allowedClasses,
    allowedIframeHostnames: opts.allowedIframeHostnames,
    allowedIframeDomains: opts.allowedIframeDomains,
    allowIframeRelativeUrls: opts.allowIframeRelativeUrls,
    allowedSchemes: opts.allowedSchemes ?? defaults.allowedSchemes,
    allowedSchemesByTag: opts.allowedSchemesByTag ?? defaults.allowedSchemesByTag,
    allowedSchemesAppliedToAttributes:
      opts.allowedSchemesAppliedToAttributes ?? defaults.allowedSchemesAppliedToAttributes,
    allowedScriptHostnames: opts.allowedScriptHostnames,
    allowedScriptDomains: opts.allowedScriptDomains,
    allowProtocolRelative: opts.allowProtocolRelative ?? defaults.allowProtocolRelative,
    allowVulnerableTags: opts.allowVulnerableTags ?? false,
    textFilter: opts.textFilter,
    exclusiveFilter: opts.exclusiveFilter,
    nestingLimit: opts.nestingLimit,
    nonTextTags: opts.nonTextTags ?? ["script", "style", "textarea", "option"],
    parseStyleAttributes: opts.parseStyleAttributes ?? true,
    selfClosing: opts.selfClosing ?? defaults.selfClosing,
    transformTags: opts.transformTags,
    parser: { ...defaultParserOptions, ...opts.parser },
    disallowedTagsMode: opts.disallowedTagsMode ?? defaults.disallowedTagsMode,
    enforceHtmlBoundary: opts.enforceHtmlBoundary ?? defaults.enforceHtmlBoundary,
    nonBooleanAttributes: opts.nonBooleanAttributes ?? defaults.nonBooleanAttributes,
    allowedEmptyAttributes: opts.allowedEmptyAttributes ?? defaultAllowedEmptyAttributes,
    onOpenTag: opts.onOpenTag,
    onCloseTag: opts.onCloseTag,
    preserveEscapedAttributes: opts.preserveEscapedAttributes ?? false,
  };
};

/**
 * Escape HTML for disallowed tags.
 * @internal
 */
const _escapeTag = (
  tagName: string,
  attribs: Attributes,
  selfClosing: boolean,
  preserveAttributes: boolean
): string => {
  let result = `&lt;${tagName}`;

  if (preserveAttributes) {
    F.pipe(
      Object.entries(attribs) as [string, string][],
      A.forEach(([name, value]) => {
        result += ` ${name}="${encodeHtml(value, true)}"`;
      })
    );
  }

  result = F.pipe(
    selfClosing,
    Match.value,
    Match.when(true, () => result + " /"),
    Match.orElse(() => result)
  );

  result += "&gt;";
  return result;
};

// Re-export for potential future use
void _escapeTag;

/**
 * Get allowed schemes for a tag/attribute.
 */
const getAllowedSchemes = (tagName: string, _attrName: string, options: MergedSanitizeOptions): readonly string[] => {
  // Check tag-specific schemes using Option pattern
  const tagSchemes = F.pipe(
    O.fromNullable(options.allowedSchemesByTag),
    O.filter((schemes): schemes is Record<string, readonly string[]> => schemes !== false),
    O.flatMap((schemes) => O.fromNullable(schemes[Str.toLowerCase(tagName)]))
  );

  if (O.isSome(tagSchemes)) {
    return tagSchemes.value;
  }

  // Use default schemes - handle the union type explicitly
  if (options.allowedSchemes === false) {
    return [];
  }

  return options.allowedSchemes ?? [];
};

/**
 * Check if value is null or undefined
 */
const isNullOrUndefined = P.or(P.isNull, P.isUndefined);

/**
 * Check if disallowed tags mode is a discard mode
 */
const isDiscardMode = (mode: string | undefined): boolean =>
  F.pipe(
    mode ?? "discard",
    Match.value,
    Match.when("discard", thunkTrue),
    Match.when("completelyDiscard", thunkTrue),
    Match.orElse(thunkFalse)
  );

/**
 * Check if disallowed tags mode is an escape mode
 */
const isEscapeMode = (mode: string | undefined): boolean =>
  F.pipe(
    mode ?? "discard",
    Match.value,
    Match.when("escape", thunkTrue),
    Match.when("recursiveEscape", thunkTrue),
    Match.orElse(thunkFalse)
  );

/**
 * Process attribute entries and build attribute string
 */
const processAttributeEntries = (
  entries: readonly [string, string][],
  processor: (name: string, value: string) => string | undefined
): string =>
  F.pipe(
    entries,
    A.filterMap(([name, value]) => O.fromNullable(processor(name, value))),
    A.join("")
  );

/**
 * Sanitize HTML string.
 *
 * @example
 * ```typescript
 * import { sanitizeHtml } from "@beep/utils/sanitize-html"
 *
 * // Basic usage
 * sanitizeHtml("<script>alert('XSS')</script><p>Hello</p>")
 * // "<p>Hello</p>"
 *
 * // Custom allowed tags
 * sanitizeHtml("<b>Bold</b><i>Italic</i>", {
 *   allowedTags: ["b"]
 * })
 * // "<b>Bold</b>Italic"
 *
 * // Allow all tags
 * sanitizeHtml("<div>Content</div>", {
 *   allowedTags: false,
 *   allowedAttributes: false
 * })
 * // "<div>Content</div>"
 * ```
 *
 * @since 0.1.0
 * @category sanitization
 */
export const sanitizeHtml = (
  dirty: string | number | null | undefined,
  options?: undefined | SanitizeOptions
): string => {
  // Handle null/undefined/number input using Effect predicates
  if (isNullOrUndefined(dirty)) {
    return "";
  }

  const html = P.isNumber(dirty) ? String(dirty) : dirty;

  if (Str.isEmpty(html)) {
    return "";
  }

  const opts = mergeOptions(options);

  // Warn about vulnerable tags
  warnAboutVulnerableTags(opts.allowedTags, opts.allowVulnerableTags);

  let result = "";
  let depth = 0;
  const stack: InternalFrame[] = [];
  const skipMap: Record<number, boolean> = {};
  const transformMap: Record<number, string> = {};
  let skipText = false;
  let skipTextDepth = 0;
  let addedText = false;
  let tempResult = "";
  let foundHtmlTag = false;
  let insideHtml = false;

  // Parse HTML into tokens
  const tokens = parseHtml(html, opts.parser);

  const processStartTag = (token: StartTagToken): void => {
    const originalName = token.name;
    let tagName = originalName;
    let attribs = { ...token.attributes };

    // Notify callback
    opts.onOpenTag?.(tagName, attribs);

    // Check for HTML boundary enforcement
    if (opts.enforceHtmlBoundary && tagName === "html") {
      if (!foundHtmlTag) {
        foundHtmlTag = true;
        insideHtml = true;
        result = "";
      }
      return;
    }

    if (opts.enforceHtmlBoundary && !insideHtml && !foundHtmlTag) {
      // Store text before <html> to potentially restore
    }

    if (skipText) {
      skipTextDepth++;
      return;
    }

    // Create frame
    const frame: InternalFrame = {
      tag: tagName,
      attribs,
      text: "",
      tagPosition: result.length,
      mediaChildren: [],
      openingTagLength: 0,
    };

    stack.push(frame);

    let skip = false;
    const hasText = Str.isNonEmpty(frame.text);

    // Apply transformations
    const transformed = applyTransform(tagName, attribs, opts.transformTags);
    tagName = transformed.tagName;
    attribs = { ...transformed.attribs };
    frame.tag = tagName;
    frame.attribs = attribs;

    if (!P.isUndefined(transformed.text)) {
      frame.innerText = transformed.text;
    }

    if (originalName !== tagName) {
      transformMap[depth] = tagName;
    }

    // Check if tag should be skipped
    const tagAllowed = isTagAllowed(tagName, opts.allowedTags);
    const exceedsNestingLimit = F.pipe(
      O.fromNullable(opts.nestingLimit),
      O.map((limit) => depth >= limit),
      O.getOrElse(thunkFalse)
    );

    if (!tagAllowed || exceedsNestingLimit) {
      skip = true;
      skipMap[depth] = true;

      if (isDiscardMode(opts.disallowedTagsMode)) {
        if (isNonTextTag(tagName, opts.nonTextTags ?? [])) {
          skipText = true;
          skipTextDepth = 1;
        }
      }
    }

    depth++;

    if (skip) {
      if (isDiscardMode(opts.disallowedTagsMode)) {
        // Emit text from transform if present
        if (frame.innerText && !hasText) {
          const escaped = encodeHtml(frame.innerText, false);
          result = F.pipe(
            O.fromNullable(opts.textFilter),
            O.map((filter) => filter(escaped, tagName)),
            O.getOrElse(() => escaped),
            (text) => result + text
          );
          addedText = true;
        }
        return;
      }

      // Escape mode
      tempResult = result;
      result = "";
    }

    // Build tag output
    let tagOutput = `<${tagName}`;

    // Handle script src validation
    if (tagName === "script" && (opts.allowedScriptHostnames || opts.allowedScriptDomains)) {
      frame.innerText = "";
    }

    // Process attributes
    const isEscaping = skip && isEscapeMode(opts.disallowedTagsMode);
    const shouldPreserveEscapedAttrs = isEscaping && opts.preserveEscapedAttributes;

    if (shouldPreserveEscapedAttrs) {
      tagOutput += processAttributeEntries(
        Object.entries(attribs) as [string, string][],
        (name, value) => ` ${name}="${encodeHtml(value, true)}"`
      );
    } else if (opts.allowedAttributes !== false) {
      // Filter attributes
      const filteredAttrs = filterAttributes(tagName, attribs, {
        allowedAttributes: opts.allowedAttributes ?? {},
        nonBooleanAttributes: opts.nonBooleanAttributes ?? [],
        allowedEmptyAttributes: opts.allowedEmptyAttributes ?? [],
      });

      // Process each attribute
      F.pipe(
        Object.entries(filteredAttrs) as [string, string][],
        A.forEach(([name, value]) => {
          if (!isValidAttributeName(name)) return;

          let attrValue = value;

          // Check URL schemes
          const shouldCheckScheme = A.some(
            opts.allowedSchemesAppliedToAttributes ?? [],
            (attr) => Str.toLowerCase(attr) === Str.toLowerCase(name)
          );

          if (shouldCheckScheme) {
            const schemes = getAllowedSchemes(tagName, name, opts);
            if (
              isNaughtyHref(attrValue, {
                allowedSchemes: schemes,
                allowProtocolRelative: opts.allowProtocolRelative ?? true,
              })
            ) {
              return;
            }
          }

          // Special handling for script src
          if (tagName === "script" && name === "src") {
            if (opts.allowedScriptHostnames || opts.allowedScriptDomains) {
              if (
                !validateScriptSrc(attrValue, {
                  allowedScriptHostnames: opts.allowedScriptHostnames,
                  allowedScriptDomains: opts.allowedScriptDomains,
                  allowProtocolRelative: opts.allowProtocolRelative ?? true,
                })
              ) {
                return;
              }
            }
          }

          // Special handling for iframe src
          if (tagName === "iframe" && name === "src") {
            if (
              !validateIframeSrc(attrValue, {
                allowedIframeHostnames: opts.allowedIframeHostnames,
                allowedIframeDomains: opts.allowedIframeDomains,
                allowIframeRelativeUrls: opts.allowIframeRelativeUrls,
                allowProtocolRelative: opts.allowProtocolRelative ?? true,
              })
            ) {
              return;
            }
          }

          // Handle srcset
          if (name === "srcset") {
            const schemes = getAllowedSchemes(tagName, "src", opts);
            attrValue = filterSrcset(attrValue, {
              allowedSchemes: schemes,
              allowProtocolRelative: opts.allowProtocolRelative ?? true,
            });
            if (Str.isEmpty(attrValue)) return;
          }

          // Handle class filtering
          if (name === "class" && opts.allowedClasses) {
            attrValue = filterClasses(attrValue, tagName, opts.allowedClasses);
            if (Str.isEmpty(attrValue)) return;
          }

          // Handle style filtering
          if (name === "style" && opts.parseStyleAttributes) {
            if (opts.allowedStyles) {
              attrValue = filterStyles(attrValue, tagName, opts.allowedStyles);
              if (Str.isEmpty(attrValue)) return;
            }
          }

          // Add attribute to output
          // If the attribute made it through filterAttributes with an empty value,
          // it's either a boolean attribute or an allowed empty attribute
          const allowedEmpty = opts.allowedEmptyAttributes ?? [];
          const nonBooleanAttrs = opts.nonBooleanAttributes ?? [];
          const isBooleanAttr = !A.some(
            nonBooleanAttrs,
            (attr) => attr === "*" || Str.toLowerCase(attr) === Str.toLowerCase(name)
          );

          const isAllowedEmpty = A.contains(allowedEmpty, name);
          const hasValue = Str.isNonEmpty(attrValue);

          if (hasValue || isAllowedEmpty || isBooleanAttr) {
            tagOutput += ` ${name}`;
            if (hasValue) {
              tagOutput += `="${encodeHtml(attrValue, true)}"`;
            } else if (isAllowedEmpty) {
              tagOutput += '=""';
            }
            // Boolean attributes without values are output without ="..."
          }
        })
      );
    } else {
      // Allow all attributes
      tagOutput += processAttributeEntries(
        Object.entries(attribs) as [string, string][],
        (name, value) => ` ${name}="${encodeHtml(value, true)}"`
      );
    }

    // Close tag
    if (isSelfClosingTag(tagName, opts.selfClosing ?? [])) {
      tagOutput += " />";
    } else {
      tagOutput += ">";
      if (frame.innerText && !hasText && P.isNullable(opts.textFilter)) {
        tagOutput += encodeHtml(frame.innerText, false);
        addedText = true;
      }
    }

    result += tagOutput;

    if (skip) {
      result = tempResult + encodeHtml(result, false);
      tempResult = "";
    }

    frame.openingTagLength = result.length - frame.tagPosition;
  };

  const processEndTag = (name: string, isImplied = false): void => {
    opts.onCloseTag?.(name, isImplied);

    if (skipText) {
      skipTextDepth--;
      if (skipTextDepth === 0) {
        skipText = false;
      } else {
        return;
      }
    }

    const frameOption = A.last(stack);
    if (O.isNone(frameOption)) return;

    const frame = frameOption.value;
    // Pop must happen after we've confirmed the tag matches

    if (frame.tag !== Str.toLowerCase(name)) {
      // Mismatched tag, don't pop
      return;
    }

    // Now we can safely pop
    stack.pop();

    if (opts.enforceHtmlBoundary && name === "html") {
      skipText = true;
    }

    depth--;

    const skip = skipMap[depth];
    if (skip) {
      delete skipMap[depth];

      if (isDiscardMode(opts.disallowedTagsMode)) {
        // Update parent text
        F.pipe(
          A.last(stack),
          O.map((parent) => {
            parent.text += frame.text;
          })
        );
        return;
      }
      tempResult = result;
      result = "";
    }

    let tagName: string = name;
    const transformedName = transformMap[depth];
    if (!P.isUndefined(transformedName)) {
      tagName = transformedName;
      delete transformMap[depth];
    }

    // Check exclusive filter
    if (opts.exclusiveFilter) {
      const publicFrame: Frame = {
        tag: frame.tag,
        attribs: frame.attribs,
        text: frame.text,
        tagPosition: frame.tagPosition,
        mediaChildren: frame.mediaChildren,
      };

      const filterResult = opts.exclusiveFilter(publicFrame);
      if (filterResult === "excludeTag") {
        if (skip) {
          result = tempResult;
          tempResult = "";
        }
        // Remove opening tag but keep content
        result =
          Str.slice(0, frame.tagPosition)(result) + Str.slice(frame.tagPosition + frame.openingTagLength)(result);
        return;
      }
      if (filterResult) {
        // Remove entire tag including content
        result = Str.slice(0, frame.tagPosition)(result);
        return;
      }
    }

    // Update parent media children
    F.pipe(
      A.last(stack),
      O.filter(() => isMediaTag(frame.tag)),
      O.map((parent) => {
        parent.mediaChildren.push(frame.tag);
      })
    );

    // Update parent text
    F.pipe(
      A.last(stack),
      O.map((parent) => {
        parent.text += frame.text;
      })
    );

    // Skip closing tag for self-closing or implied closes on escaped tags
    const isSelfClosing = isSelfClosingTag(tagName, opts.selfClosing ?? []);
    const isImpliedEscaped =
      isImplied && !isTagAllowed(tagName, opts.allowedTags) && isEscapeMode(opts.disallowedTagsMode);

    if (isSelfClosing || isImpliedEscaped) {
      if (skip) {
        result = tempResult;
        tempResult = "";
      }
      return;
    }

    result += `</${tagName}>`;

    if (skip) {
      result = tempResult + encodeHtml(result, false);
      tempResult = "";
    }

    addedText = false;
  };

  const processText = (content: string): void => {
    if (skipText) return;

    const lastFrame = F.pipe(A.last(stack), O.getOrUndefined);
    const tagName = lastFrame?.tag ?? "";

    let text = lastFrame?.innerText ?? content;

    const isCompletelyDiscard =
      opts.disallowedTagsMode === "completelyDiscard" && !isTagAllowed(tagName, opts.allowedTags);

    const isScriptOrStyleDiscard =
      isDiscardMode(opts.disallowedTagsMode) && (tagName === "script" || tagName === "style");

    if (isCompletelyDiscard) {
      text = "";
    } else if (isScriptOrStyleDiscard) {
      // Don't escape content of script/style tags when allowed
      result += text;
    } else if (!addedText) {
      const escaped = encodeHtml(text, false);
      result = F.pipe(
        O.fromNullable(opts.textFilter),
        O.map((filter) => filter(escaped, tagName)),
        O.getOrElse(() => escaped),
        (processedText) => result + processedText
      );
    }

    F.pipe(
      O.fromNullable(lastFrame),
      O.map((frame) => {
        frame.text += content;
      })
    );
  };

  // Process tokens using matchToken from token module
  A.forEach(tokens, (token) =>
    matchToken(token, {
      StartTag: processStartTag,
      EndTag: (t) => processEndTag(t.name),
      Text: (t) => processText(t.content),
      Comment: F.constVoid,
      Doctype: F.constVoid,
    })
  );

  // Close any remaining open tags
  F.pipe(
    stack,
    A.reverse,
    A.forEach((frame) => {
      if (!isSelfClosingTag(frame.tag, opts.selfClosing ?? [])) {
        processEndTag(frame.tag, true);
      }
    })
  );

  // Clear the stack since we processed all frames
  stack.length = 0;

  return result;
};

// Re-export simpleTransform for convenience
export { simpleTransform };
