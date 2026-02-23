/**
 * Token types for the HTML parser
 *
 * This module provides Effect-idiomatic token types and type guards
 * using discriminated unions and Effect Predicate/Match utilities.
 *
 * @since 0.1.0
 * @module
 */

import { dual, pipe } from "effect/Function";
import * as Match from "effect/Match";
import * as P from "effect/Predicate";
import type { Attributes } from "../types";

/**
 * Token tag literal types for exhaustive matching.
 *
 * @since 0.1.0
 * @category types
 */
export type TokenTag = "StartTag" | "EndTag" | "Text" | "Comment" | "Doctype";

/**
 * Start tag token (e.g., `<div class="foo">`)
 *
 * @since 0.1.0
 * @category tokens
 */
export interface StartTagToken {
  readonly _tag: "StartTag";
  readonly name: string;
  readonly attributes: Attributes;
  readonly selfClosing: boolean;
}

/**
 * End tag token (e.g., `</div>`)
 *
 * @since 0.1.0
 * @category tokens
 */
export interface EndTagToken {
  readonly _tag: "EndTag";
  readonly name: string;
}

/**
 * Text content token
 *
 * @since 0.1.0
 * @category tokens
 */
export interface TextToken {
  readonly _tag: "Text";
  readonly content: string;
}

/**
 * HTML comment token (e.g., `<!-- comment -->`)
 *
 * @since 0.1.0
 * @category tokens
 */
export interface CommentToken {
  readonly _tag: "Comment";
  readonly content: string;
}

/**
 * DOCTYPE token (e.g., `<!DOCTYPE html>`)
 *
 * @since 0.1.0
 * @category tokens
 */
export interface DoctypeToken {
  readonly _tag: "Doctype";
  readonly content: string;
}

/**
 * Union of all token types
 *
 * @since 0.1.0
 * @category tokens
 */
export type Token = StartTagToken | EndTagToken | TextToken | CommentToken | DoctypeToken;

/**
 * Creates a start tag token.
 *
 * @since 0.1.0
 * @category constructors
 */
export const startTag = (name: string, attributes: Attributes = {}, selfClosing = false): StartTagToken => ({
  _tag: "StartTag",
  name,
  attributes,
  selfClosing,
});

/**
 * Creates an end tag token.
 *
 * @since 0.1.0
 * @category constructors
 */
export const endTag = (name: string): EndTagToken => ({
  _tag: "EndTag",
  name,
});

/**
 * Creates a text token.
 *
 * @since 0.1.0
 * @category constructors
 */
export const text = (content: string): TextToken => ({
  _tag: "Text",
  content,
});

/**
 * Creates a comment token.
 *
 * @since 0.1.0
 * @category constructors
 */
export const comment = (content: string): CommentToken => ({
  _tag: "Comment",
  content,
});

/**
 * Creates a doctype token.
 *
 * @since 0.1.0
 * @category constructors
 */
export const doctype = (content: string): DoctypeToken => ({
  _tag: "Doctype",
  content,
});

/**
 * Creates a type guard for a specific token tag.
 * Uses Effect Predicate pattern for composability.
 *
 * @since 0.1.0
 * @category internal
 */
const hasTag =
  <T extends TokenTag>(tag: T): P.Refinement<Token, Extract<Token, { readonly _tag: T }>> =>
  (token): token is Extract<Token, { readonly _tag: T }> =>
    P.isObject(token) && "_tag" in token && token._tag === tag;

/**
 * Type guard for start tag tokens.
 *
 * @example
 * ```typescript
 * import { isStartTag, startTag } from "@beep/utils/sanitize-html/parser/token"
 *
 * const token = startTag("div", { class: "foo" })
 * if (isStartTag(token)) {
 *   console.log(token.name) // "div"
 *   console.log(token.attributes) // { class: "foo" }
 * }
 * ```
 *
 * @since 0.1.0
 * @category guards
 */
export const isStartTag: P.Refinement<Token, StartTagToken> = hasTag("StartTag");

/**
 * Type guard for end tag tokens.
 *
 * @example
 * ```typescript
 * import { isEndTag, endTag } from "@beep/utils/sanitize-html/parser/token"
 *
 * const token = endTag("div")
 * if (isEndTag(token)) {
 *   console.log(token.name) // "div"
 * }
 * ```
 *
 * @since 0.1.0
 * @category guards
 */
export const isEndTag: P.Refinement<Token, EndTagToken> = hasTag("EndTag");

/**
 * Type guard for text tokens.
 *
 * @example
 * ```typescript
 * import { isText, text } from "@beep/utils/sanitize-html/parser/token"
 *
 * const token = text("Hello, world!")
 * if (isText(token)) {
 *   console.log(token.content) // "Hello, world!"
 * }
 * ```
 *
 * @since 0.1.0
 * @category guards
 */
export const isText: P.Refinement<Token, TextToken> = hasTag("Text");

/**
 * Type guard for comment tokens.
 *
 * @example
 * ```typescript
 * import { isComment, comment } from "@beep/utils/sanitize-html/parser/token"
 *
 * const token = comment("This is a comment")
 * if (isComment(token)) {
 *   console.log(token.content) // "This is a comment"
 * }
 * ```
 *
 * @since 0.1.0
 * @category guards
 */
export const isComment: P.Refinement<Token, CommentToken> = hasTag("Comment");

/**
 * Type guard for doctype tokens.
 *
 * @example
 * ```typescript
 * import { isDoctype, doctype } from "@beep/utils/sanitize-html/parser/token"
 *
 * const token = doctype("html")
 * if (isDoctype(token)) {
 *   console.log(token.content) // "html"
 * }
 * ```
 *
 * @since 0.1.0
 * @category guards
 */
export const isDoctype: P.Refinement<Token, DoctypeToken> = hasTag("Doctype");

/**
 * Handlers object type for exhaustive token matching.
 *
 * @since 0.1.0
 * @category matching
 */
export interface TokenHandlers<R> {
  readonly StartTag: (token: StartTagToken) => R;
  readonly EndTag: (token: EndTagToken) => R;
  readonly Text: (token: TextToken) => R;
  readonly Comment: (token: CommentToken) => R;
  readonly Doctype: (token: DoctypeToken) => R;
}

/**
 * Pattern match on a token to extract a value.
 *
 * This function provides exhaustive pattern matching on tokens
 * using Effect's Match module. It ensures all token types are handled.
 *
 * @example
 * ```typescript
 * import { matchToken, startTag, text } from "@beep/utils/sanitize-html/parser/token"
 *
 * const token = startTag("div", { class: "foo" })
 * const result = matchToken(token, {
 *   StartTag: (t) => `Opening: ${t.name}`,
 *   EndTag: (t) => `Closing: ${t.name}`,
 *   Text: (t) => `Text: ${t.content}`,
 *   Comment: (t) => `Comment: ${t.content}`,
 *   Doctype: (t) => `Doctype: ${t.content}`,
 * })
 * // result === "Opening: div"
 * ```
 *
 * @since 0.1.0
 * @category matching
 */
export const matchToken: {
  <R>(handlers: TokenHandlers<R>): (token: Token) => R;
  <R>(token: Token, handlers: TokenHandlers<R>): R;
} = dual(
  2,
  <R>(token: Token, handlers: TokenHandlers<R>): R =>
    pipe(
      Match.type<Token>(),
      Match.tag("StartTag", handlers.StartTag),
      Match.tag("EndTag", handlers.EndTag),
      Match.tag("Text", handlers.Text),
      Match.tag("Comment", handlers.Comment),
      Match.tag("Doctype", handlers.Doctype),
      Match.exhaustive
    )(token) as R
);

/**
 * Handlers object type for partial token matching with fallback.
 *
 * @since 0.1.0
 * @category matching
 */
export interface TokenHandlersPartial<R> {
  readonly StartTag?: ((token: StartTagToken) => R) | undefined;
  readonly EndTag?: ((token: EndTagToken) => R) | undefined;
  readonly Text?: ((token: TextToken) => R) | undefined;
  readonly Comment?: ((token: CommentToken) => R) | undefined;
  readonly Doctype?: ((token: DoctypeToken) => R) | undefined;
  readonly orElse: (token: Token) => R;
}

/**
 * Pattern match on a token with a fallback for unhandled cases.
 *
 * This function allows partial pattern matching with an `orElse` fallback.
 * Useful when you only care about specific token types.
 *
 * @example
 * ```typescript
 * import { matchTokenOrElse, startTag, text } from "@beep/utils/sanitize-html/parser/token"
 *
 * const token = text("Hello")
 * const result = matchTokenOrElse(token, {
 *   StartTag: (t) => `tag: ${t.name}`,
 *   orElse: () => "other",
 * })
 * // result === "other"
 * ```
 *
 * @since 0.1.0
 * @category matching
 */
export const matchTokenOrElse: {
  <R>(handlers: TokenHandlersPartial<R>): (token: Token) => R;
  <R>(token: Token, handlers: TokenHandlersPartial<R>): R;
} = dual(
  2,
  <R>(token: Token, handlers: TokenHandlersPartial<R>): R =>
    pipe(
      Match.type<Token>(),
      Match.when(isStartTag, (t) => (handlers.StartTag !== undefined ? handlers.StartTag(t) : handlers.orElse(t))),
      Match.when(isEndTag, (t) => (handlers.EndTag !== undefined ? handlers.EndTag(t) : handlers.orElse(t))),
      Match.when(isText, (t) => (handlers.Text !== undefined ? handlers.Text(t) : handlers.orElse(t))),
      Match.when(isComment, (t) => (handlers.Comment !== undefined ? handlers.Comment(t) : handlers.orElse(t))),
      Match.when(isDoctype, (t) => (handlers.Doctype !== undefined ? handlers.Doctype(t) : handlers.orElse(t))),
      Match.exhaustive
    )(token) as R
);

/**
 * Get the content from a token if it has content (Text, Comment, or Doctype).
 * Returns undefined for StartTag and EndTag tokens.
 *
 * @example
 * ```typescript
 * import { getContent, text, startTag } from "@beep/utils/sanitize-html/parser/token"
 *
 * getContent(text("Hello")) // "Hello"
 * getContent(startTag("div")) // undefined
 * ```
 *
 * @since 0.1.0
 * @category accessors
 */
export const getContent = (token: Token): string | undefined =>
  matchTokenOrElse(token, {
    Text: (t) => t.content,
    Comment: (t) => t.content,
    Doctype: (t) => t.content,
    orElse: () => undefined,
  });

/**
 * Get the tag name from a token if it has one (StartTag or EndTag).
 * Returns undefined for Text, Comment, and Doctype tokens.
 *
 * @example
 * ```typescript
 * import { getTagName, startTag, text } from "@beep/utils/sanitize-html/parser/token"
 *
 * getTagName(startTag("div")) // "div"
 * getTagName(text("Hello")) // undefined
 * ```
 *
 * @since 0.1.0
 * @category accessors
 */
export const getTagName = (token: Token): string | undefined =>
  matchTokenOrElse(token, {
    StartTag: (t) => t.name,
    EndTag: (t) => t.name,
    orElse: () => undefined,
  });

/**
 * Check if a token is a tag (StartTag or EndTag).
 *
 * @example
 * ```typescript
 * import { isTag, startTag, text } from "@beep/utils/sanitize-html/parser/token"
 *
 * isTag(startTag("div")) // true
 * isTag(text("Hello")) // false
 * ```
 *
 * @since 0.1.0
 * @category guards
 */
export const isTag: P.Refinement<Token, StartTagToken | EndTagToken> = (token): token is StartTagToken | EndTagToken =>
  isStartTag(token) || isEndTag(token);

/**
 * Check if a token has content (Text, Comment, or Doctype).
 *
 * @example
 * ```typescript
 * import { hasContent, text, startTag } from "@beep/utils/sanitize-html/parser/token"
 *
 * hasContent(text("Hello")) // true
 * hasContent(startTag("div")) // false
 * ```
 *
 * @since 0.1.0
 * @category guards
 */
export const hasContent: P.Refinement<Token, TextToken | CommentToken | DoctypeToken> = (
  token
): token is TextToken | CommentToken | DoctypeToken => isText(token) || isComment(token) || isDoctype(token);
