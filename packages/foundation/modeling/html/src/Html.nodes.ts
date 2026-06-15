/**
 * Hand-authored non-element AST node classes.
 *
 * These are the leaf DOM node kinds that sit alongside element classes in the
 * {@link HtmlNode} union. Their `_tag` values use the DOM `nodeName` convention
 * (`#text`, `#comment`, `#doctype`) so they can never collide with element tag
 * names. Recursive container nodes (`#document`, `#fragment`) are emitted into
 * the generated `Html.model.ts` because they reference the recursive child list.
 *
 * @packageDocumentation @beep/html/Html.nodes
 * @since 0.0.0
 */
import { $HtmlId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $HtmlId.create("Html.nodes");

/**
 * A character-data text node.
 *
 * @example
 * ```ts
 * import { Text } from "@beep/html/Html.nodes"
 *
 * const node = Text.make({ value: "Hello" })
 * console.log(node._tag) // "#text"
 * ```
 *
 * @category nodes
 * @since 0.0.0
 */
export class Text extends S.TaggedClass<Text>($I`Text`)(
  "#text",
  {
    value: S.String.annotateKey({ description: "Character data of the text node." }),
  },
  $I.annote("Text", { description: "A character-data text node." })
) {
  static readonly fromValue = (value: string): Text => Text.make({ value });
}

/**
 * Companion namespace for {@link Text}.
 *
 * @category nodes
 * @since 0.0.0
 */
export declare namespace Text {
  /** @since 0.0.0 */
  export interface Type {
    readonly _tag: "#text";
    readonly value: string;
  }
  /** @since 0.0.0 */
  export interface Encoded extends Type {}
}

/**
 * An HTML comment node (`<!-- ... -->`).
 *
 * @category nodes
 * @since 0.0.0
 */
export class Comment extends S.TaggedClass<Comment>($I`Comment`)(
  "#comment",
  {
    value: S.String.annotateKey({ description: "Comment text (without the delimiters)." }),
  },
  $I.annote("Comment", { description: "An HTML comment node." })
) {
  static readonly fromValue = (value: string): Comment => Comment.make({ value });
}

/**
 * Companion namespace for {@link Comment}.
 *
 * @category nodes
 * @since 0.0.0
 */
export declare namespace Comment {
  /** @since 0.0.0 */
  export interface Type {
    readonly _tag: "#comment";
    readonly value: string;
  }
  /** @since 0.0.0 */
  export interface Encoded extends Type {}
}

/**
 * A document type declaration (`<!DOCTYPE html>`).
 *
 * @category nodes
 * @since 0.0.0
 */
export class Doctype extends S.TaggedClass<Doctype>($I`Doctype`)(
  "#doctype",
  {
    name: S.optionalKey(S.String).annotateKey({ description: 'Document type name (e.g. "html").' }),
    publicId: S.optionalKey(S.String).annotateKey({ description: "Legacy public identifier." }),
    systemId: S.optionalKey(S.String).annotateKey({ description: "Legacy system identifier." }),
  },
  $I.annote("Doctype", { description: "A document type declaration." })
) {
  static readonly html = (): Doctype => Doctype.make({ name: "html" });
}

/**
 * Companion namespace for {@link Doctype}.
 *
 * @category nodes
 * @since 0.0.0
 */
export declare namespace Doctype {
  /** @since 0.0.0 */
  export interface Type {
    readonly _tag: "#doctype";
    readonly name?: string;
    readonly publicId?: string;
    readonly systemId?: string;
  }
  /** @since 0.0.0 */
  export interface Encoded extends Type {}
}
