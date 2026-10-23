// Ported from commonmark.js@0.31.2 (https://github.com/commonmark/commonmark.js)
// Copyright (c) 2014-2023 John MacFarlane
// License: BSD-2-Clause
//
// `parseOpenBracket`, `parseBang` and `parseCloseBracket`: links and images,
// inline and by reference.
//
// Port notes, three changes from upstream:
//
// 1. A reference that matches the refmap becomes a `linkReference` /
//    `imageReference` carrying the identifier, the raw label and the
//    reference type, instead of upstream's eagerly resolved link with the
//    destination copied in. This package edits markdown, so which definition
//    a reference points at has to survive the round trip. Formation is
//    unchanged: a label with NO matching definition does not form a link at
//    all and the brackets stay literal text, exactly as upstream has it and
//    as the spec requires.
// 2. Destinations and titles are stored DECODED — no percent-encoding — per
//    mdast (`references.ts` carries the same note).
// 3. An image's bracket content becomes its `alt` string rather than child
//    nodes, because mdast images have no children. Upstream computes the same
//    string at render time by re-rendering the children with tags disabled.

import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Str from "effect/String";
import { childrenOf, insertAfter, makeInlineNode, moveSiblings, unlink } from "../inlineNode.ts";
import { InlineConstruct } from "../inlineTypes.ts";
import { unitAt } from "../patterns.ts";
import { normalizeReference, ReferenceScanner } from "../references.ts";
import type { InlineNode, InlineNodeType } from "../inlineNode.ts";
import type { Bracket, InlineScanner } from "../inlineTypes.ts";
import type { ReferenceType } from "../nodes.ts";

const C_BANG = "!";
const C_CARET = "^";
const C_OPEN_BRACKET = "[";
const C_CLOSE_BRACKET = "]";
const C_OPEN_PAREN = "(";
const C_CLOSE_PAREN = ")";

const reWhitespaceChar = /^[ \t\n\v\f\r]/;

/**
 * Run one of `references.ts`'s grammar functions over the subject at the
 * scanner's cursor, keeping the two cursors in step.
 *
 * **Details**
 *
 * The destination, title and label grammars are identical wherever they
 * appear, so a link reuses exactly what a definition parsed with.
 */
const withReferenceScanner: {
  <A>(scanner: InlineScanner, run: (reference: ReferenceScanner) => A): A;
  <A>(run: (reference: ReferenceScanner) => A): (scanner: InlineScanner) => A;
} = dual(2, <A>(scanner: InlineScanner, run: (reference: ReferenceScanner) => A): A => {
  const reference = new ReferenceScanner(scanner.subject);
  reference.pos = scanner.pos;
  const result = run(reference);
  scanner.pos = reference.pos;
  return result;
});

/**
 * The plain-text flattening of a node list — an image's `alt`.
 *
 * **Details**
 *
 * ITERATIVE ON PURPOSE. This runs while the brackets close, before
 * materialization's depth guard has seen anything, and the content it walks
 * can nest as deeply as the input has balanced delimiters: the recursive
 * spelling died with a `RangeError` — a defect, not a typed error — on
 * `![` plus ten thousand nested emphasis markers. A flattening has no reason
 * to recurse, so it does not, and needs no cap.
 */
const plainTextOf = (nodes: ReadonlyArray<InlineNode>): string => {
  let text = "";
  // A stack of node lists rather than a stack of frames: entries are
  // pushed in reverse so the walk stays left to right.
  const pending: InlineNode[] = [...nodes].reverse();

  while (pending.length > 0) {
    // The loop proves the stack is non-empty; every entry is a real node.
    const node = A.getUnsafe(pending, pending.length - 1);
    pending.pop();

    const leaf = leafText(node);
    if (leaf !== undefined) {
      text += leaf;
      continue;
    }
    const children = childrenOf(node);
    for (let index = children.length - 1; index >= 0; index -= 1) {
      pending.push(A.getUnsafe(children, index));
    }
  }

  return text;
};

/**
 * The kinds whose flattening is their `value`. A nested image contributes the
 * alt text it already flattened.
 */
const VALUE_KINDS: ReadonlyArray<InlineNodeType> = ["text", "inlineCode", "html", "image", "imageReference"];

/** What a leaf contributes to a flattening, or `undefined` for a container. */
const leafText = (node: InlineNode): string | undefined => {
  if (node.type === "break") {
    return "\n";
  }
  return A.contains(VALUE_KINDS, node.type) ? node.value : undefined;
};

/**
 * Recognizes `[` as a potential link opener.
 *
 * **Example** (Inspect the link-opening trigger)
 *
 * ```ts
 * import { linkOpenConstruct } from "@beep/markdown/internal/inlines/link"
 *
 * console.log(linkOpenConstruct.triggers[0]) // [
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const linkOpenConstruct = new InlineConstruct("linkOpen", [C_OPEN_BRACKET], (scanner) => {
  const startpos = scanner.pos;
  scanner.pos += 1;
  const node = scanner.appendText("[", startpos, scanner.pos);
  // The index points AT the bracket, so a collapsed or shortcut
  // reference can slice its label straight back out of the subject.
  scanner.addBracket(node, startpos, false);
  return true;
});

/**
 * Build the `!` construct — an image opener when a `[` follows, otherwise
 * literal.
 *
 * **Details**
 *
 * `caretOpensImage` is the second GFM footnote seam, and the surprising one.
 * cmark-gfm's bang handler reads
 *
 * `if (peek_char(subj) == '[' && peek_char_n(subj, 1) != '^') {`
 *
 * so under GFM `![^` NEVER opens an image: the `!` stays literal text and the
 * `[` becomes an ordinary bracket, which is what lets `text![^1]` render as a
 * literal `!` followed by a footnote reference (`extensions.txt` example 23
 * pins exactly that). It also means the footnote branch in the close-bracket
 * handler can never see an image opener, which is why that branch does not
 * test for one. CommonMark passes `true` and is untouched.
 *
 * **Example** (Construct the GFM image opener)
 *
 * ```ts
 * import { makeImageOpenConstruct } from "@beep/markdown/internal/inlines/link"
 *
 * console.log(makeImageOpenConstruct(false).name) // imageOpen
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const makeImageOpenConstruct = (caretOpensImage: boolean): InlineConstruct =>
  new InlineConstruct("imageOpen", [C_BANG], (scanner) => {
    const startpos = scanner.pos;
    scanner.pos += 1;
    if (
      scanner.peek() === C_OPEN_BRACKET &&
      (caretOpensImage || unitAt(scanner.subject, scanner.pos + 1) !== C_CARET)
    ) {
      scanner.pos += 1;
      const node = scanner.appendText("![", startpos, scanner.pos);
      scanner.addBracket(node, startpos + 1, true);
      return true;
    }
    scanner.appendText("!", startpos, scanner.pos);
    return true;
  });

/**
 * Recognizes `!` as an image opener when a `[` follows, otherwise literal.
 *
 * **Example** (Inspect the CommonMark image trigger)
 *
 * ```ts
 * import { imageOpenConstruct } from "@beep/markdown/internal/inlines/link"
 *
 * console.log(imageOpenConstruct.triggers[0]) // !
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const imageOpenConstruct = makeImageOpenConstruct(true);

/**
 * A dialect's last chance at a `]` that closed nothing.
 *
 * **Details**
 *
 * cmark-gfm's footnote reference is not a construct of its own: it is a branch
 * under `handle_close_bracket`'s `noMatch` label, reached only once an inline
 * link, a full reference, a collapsed reference and a shortcut reference have
 * all failed. This is that branch as a seam, so a GFM-only construct can sit
 * exactly where the C puts it without a `gfm` copy of the 150 lines above it,
 * and without giving the footnote a chance to beat a real link.
 *
 * Returning `true` means the fallback handled everything — including popping
 * the bracket — and the close-bracket construct stops.
 *
 * @category type-level
 * @since 0.0.0
 */
export type LinkCloseFallback = {
  /**
   * `bracketPos` is the index of the `]` in the subject; `afterBracket` is
   * the index just past it, where the cursor must end up.
   */
  (scanner: InlineScanner, opener: Bracket, bracketPos: number, afterBracket: number): boolean;
  (opener: Bracket, bracketPos: number, afterBracket: number): (scanner: InlineScanner) => boolean;
};

/**
 * What a closing bracket links to: an inline destination, or a reference the
 * refmap resolved.
 */
type LinkTarget =
  | { readonly kind: "inline"; readonly url: string; readonly title: string | undefined }
  | {
      readonly kind: "reference";
      readonly identifier: string;
      readonly label: string;
      readonly referenceType: ReferenceType;
    };

/**
 * An inline link's `(url "title")` tail at the cursor, or `undefined` with the
 * cursor restored.
 */
const matchInlineLink = (scanner: InlineScanner): LinkTarget | undefined => {
  if (scanner.peek() !== C_OPEN_PAREN) {
    return undefined;
  }
  const savepos = scanner.pos;
  scanner.pos += 1;
  const target = withReferenceScanner(scanner, inlineLinkTail);
  if (target === undefined) {
    scanner.pos = savepos;
  }
  return target;
};

/** The destination, optional title and `)` after an inline link's `(`. */
const inlineLinkTail = (reference: ReferenceScanner): LinkTarget | undefined => {
  reference.spnl();
  const url = reference.parseLinkDestination();
  if (url === undefined) {
    return undefined;
  }
  reference.spnl();
  // A title must be preceded by whitespace.
  const title = reWhitespaceChar.test(unitAt(reference.subject, reference.pos - 1))
    ? reference.parseLinkTitle()
    : undefined;
  reference.spnl();
  if (reference.peek() !== C_CLOSE_PAREN) {
    return undefined;
  }
  reference.pos += 1;
  return { kind: "inline", url, title };
};

/** The length of the link label at a reference scanner's cursor. */
const linkLabelLength = (reference: ReferenceScanner): number => reference.parseLinkLabel();

/**
 * The raw label a reference closing at the cursor names — `][label]`, `][]`
 * or a bare `]` — with its reference type, or `undefined` when there is none.
 */
const referenceLabel = (
  scanner: InlineScanner,
  opener: Bracket,
  startpos: number
): { readonly rawLabel: string; readonly referenceType: ReferenceType } | undefined => {
  const savepos = scanner.pos;
  const labelLength = withReferenceScanner(scanner, linkLabelLength);
  if (labelLength === 0) {
    // A shortcut reference: rewind over the spaces that were skipped.
    scanner.pos = savepos;
  }
  if (labelLength > 2) {
    return { rawLabel: Str.slice(savepos, savepos + labelLength)(scanner.subject), referenceType: "full" };
  }
  // An empty or missing second label reuses the first, which must itself
  // hold no bracket. `opener.index` is at the `[`, so this slice already
  // carries its brackets.
  return opener.bracketAfter
    ? undefined
    : {
        rawLabel: Str.slice(opener.index, startpos)(scanner.subject),
        referenceType: labelLength === 2 ? "collapsed" : "shortcut",
      };
};

/**
 * A reference closing at the cursor that the refmap resolves.
 *
 * **Details**
 *
 * THE formation rule: no definition, no link. The brackets stay literal text
 * — this is where upstream consults its refmap and where this port consults
 * the one the block pass built.
 */
const matchReference = (scanner: InlineScanner, opener: Bracket, startpos: number): LinkTarget | undefined => {
  const found = referenceLabel(scanner, opener, startpos);
  if (found === undefined || found.rawLabel === "") {
    return undefined;
  }
  const key = normalizeReference(found.rawLabel);
  return HashMap.has(scanner.refmap, key)
    ? {
        kind: "reference",
        identifier: Str.toLowerCase(key),
        // An identifier is assigned only after this non-empty raw label resolves.
        label: Str.slice(1, -1)(found.rawLabel),
        referenceType: found.referenceType,
      }
    : undefined;
};

/** Record `target` on the node a closing bracket built. */
const assignTarget = (node: InlineNode, target: LinkTarget): void => {
  if (target.kind === "inline") {
    node.data.url = target.url;
    if (target.title !== undefined) {
      node.data.title = target.title;
    }
    return;
  }
  node.data.identifier = target.identifier;
  node.data.label = target.label;
  node.data.referenceType = target.referenceType;
};

/** The kind of node a closing bracket builds. */
const linkNodeType = (target: LinkTarget, isImage: boolean): InlineNodeType => {
  if (target.kind === "inline") {
    return isImage ? "image" : "link";
  }
  return isImage ? "imageReference" : "linkReference";
};

/** Build the link or image node out of everything the brackets enclose. */
const closeLink = (scanner: InlineScanner, opener: Bracket, target: LinkTarget): void => {
  const node = makeInlineNode(linkNodeType(target, opener.image), opener.node.start, scanner.pos);
  moveSiblings(node, opener.node.next, undefined);
  insertAfter(opener.node, node);
  assignTarget(node, target);

  // Emphasis inside the brackets is resolved before the node closes, so the
  // delimiters cannot pair with anything outside it.
  scanner.processEmphasis(opener.previousDelimiter);
  scanner.removeBracket();
  unlink(opener.node);

  if (opener.image) {
    flattenImage(node);
  } else {
    // Links do not nest: every earlier link opener is spent.
    scanner.deactivateLinkOpeners();
  }
};

/** mdast images carry alt text, not children: flatten them into `value`. */
const flattenImage = (node: InlineNode): void => {
  node.value = plainTextOf(childrenOf(node));
  for (const orphan of childrenOf(node)) {
    unlink(orphan);
  }
};

/**
 * Build the `]` construct — closes a link or image, or stays literal.
 *
 * **Details**
 *
 * `onNoMatch` is the dialect seam described on {@link LinkCloseFallback}. With
 * none, this is CommonMark's close-bracket handler exactly.
 *
 * **Example** (Construct the CommonMark link closer)
 *
 * ```ts
 * import { makeLinkCloseConstruct } from "@beep/markdown/internal/inlines/link"
 *
 * console.log(makeLinkCloseConstruct().triggers[0]) // ]
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const makeLinkCloseConstruct = (onNoMatch?: LinkCloseFallback): InlineConstruct =>
  new InlineConstruct("linkClose", [C_CLOSE_BRACKET], (scanner) => {
    const bracketPos = scanner.pos;
    scanner.pos += 1;
    const startpos = scanner.pos;

    const opener = scanner.brackets;
    if (opener === undefined || !opener.active) {
      scanner.appendText("]", bracketPos, scanner.pos);
      if (opener !== undefined) {
        scanner.removeBracket();
      }
      return true;
    }

    const target = matchInlineLink(scanner) ?? matchReference(scanner, opener, startpos);
    if (target !== undefined) {
      closeLink(scanner, opener, target);
      return true;
    }

    // The `noMatch` label. The dialect seam comes first, because that is
    // where cmark-gfm's footnote branch sits: after every link shape has
    // failed, before the bracket becomes literal text.
    if (onNoMatch?.(scanner, opener, bracketPos, startpos) === true) {
      return true;
    }
    scanner.removeBracket();
    scanner.pos = startpos;
    scanner.appendText("]", bracketPos, scanner.pos);
    return true;
  });

/**
 * Closes a link or image at `]`, or leaves the bracket literal.
 *
 * **Details**
 *
 * The CommonMark spelling.
 *
 * **Example** (Inspect the CommonMark closing construct)
 *
 * ```ts
 * import { linkCloseConstruct } from "@beep/markdown/internal/inlines/link"
 *
 * console.log(linkCloseConstruct.name) // linkClose
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const linkCloseConstruct = makeLinkCloseConstruct();
