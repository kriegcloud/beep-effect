// Ported from commonmark.js@0.31.2 (https://github.com/commonmark/commonmark.js)
// Copyright (c) 2014-2023 John MacFarlane
// License: BSD-2-Clause
//
// The vocabulary the inline constructs and the inline parser share, extracted
// into a leaf for the same reason `blockTypes.ts` is one: the registry imports
// the construct modules, so the constructs cannot import the registry.
//
// Upstream dispatches on a character in a `switch` inside `parseInline`. Here
// the same dispatch is a per-dialect table keyed by trigger character, which
// is what lets the GFM constructs (autolink literals, strikethrough) register
// without touching the parser.
//
// The scanner, the two stacks and the construct records are mutable engine
// state or behaviour, not data, so they are concrete classes (D-42); only the
// parser input crosses a module boundary as a schema.

import { $MarkdownId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { RawInlineSegment } from "./blockTypes.ts";
import type * as HashMap from "effect/HashMap";
import type * as HashSet from "effect/HashSet";
import type { InlineNode } from "./inlineNode.ts";
import type { Definition } from "./nodes.ts";

const $I = $MarkdownId.create("internal/inlineTypes");

/**
 * A leaf block's raw text with the provenance needed to position what the
 * inline pass builds out of it.
 *
 * **Details**
 *
 * `RawInlineSlice` widens this with the node that will own the children;
 * a slice is therefore usable wherever a source is.
 *
 * **Example** (Validate InlineSource)
 *
 * ```ts
 * import { InlineSource } from "@beep/markdown/internal/inlineTypes"
 * import * as S from "effect/Schema"
 *
 * S.is(InlineSource)({ text: "hello", startOffset: 0, segments: [] }) // => true
 * InlineSource.make({ text: "hello", startOffset: 0, segments: [] }).text // => "hello"
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class InlineSource extends S.Opaque<InlineSource, { readonly brand: unique symbol }>()(
  S.Struct({
    text: S.String.pipe(
      $I.annoteKey("InlineSource.text", { description: "Raw inline text accumulated by a leaf block." })
    ),
    startOffset: S.Finite.pipe(
      $I.annoteKey("InlineSource.startOffset", { description: "Absolute source offset where the raw text starts." })
    ),
    segments: S.Array(RawInlineSegment).pipe(
      $I.annoteKey("InlineSource.segments", { description: "Contiguous source runs locating the accumulated text." })
    ),
  }).pipe(
    $I.annoteSchema("InlineSource", {
      description: "Plain inline parser input with source provenance for absolute positions.",
    })
  )
) {}

/**
 * The encoded (plain) shape of {@link InlineSource}, which is what the inline
 * parser accepts: the block pass hands it plain fields and nothing is decoded
 * on the way in.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace InlineSource {
  /**
   * The plain encoded fields of {@link InlineSource}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Encoded {
    readonly segments: ReadonlyArray<RawInlineSegment.Encoded>;
    readonly startOffset: number;
    readonly text: string;
  }
}

/**
 * One entry of the delimiter stack: a run of `*`, `_` or `~` that might open
 * or close, and the text node holding those characters.
 *
 * **Example** (Push a delimiter onto an empty stack)
 *
 * ```ts
 * import { makeInlineNode } from "@beep/markdown/internal/inlineNode";
 * import { Delimiter } from "@beep/markdown/internal/inlineTypes";
 *
 * const delimiter = new Delimiter("*", makeInlineNode("text", 0, 2, "**"), 2, true, false, undefined);
 * console.log(delimiter.numdelims, delimiter.next) // 2 undefined
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Delimiter {
  /**
   * Whether the run can close.
   *
   * @since 0.0.0
   */
  readonly canClose: boolean;
  /**
   * Whether the run can open.
   *
   * @since 0.0.0
   */
  readonly canOpen: boolean;
  /**
   * The delimiter character.
   *
   * @since 0.0.0
   */
  readonly cc: string;
  /**
   * The stack entry above this one.
   *
   * @since 0.0.0
   */
  next: Delimiter | undefined = undefined;
  /**
   * The text node carrying the run; emphasis truncates it in place.
   *
   * @since 0.0.0
   */
  readonly node: InlineNode;
  /**
   * How many delimiters are still unused.
   *
   * @since 0.0.0
   */
  numdelims: number;
  /**
   * How many there were to begin with — the multiple-of-three rule reads this.
   *
   * @since 0.0.0
   */
  readonly origdelims: number;
  /**
   * The stack entry below this one.
   *
   * @since 0.0.0
   */
  previous: Delimiter | undefined;

  constructor(
    cc: string,
    node: InlineNode,
    numdelims: number,
    canOpen: boolean,
    canClose: boolean,
    previous: Delimiter | undefined
  ) {
    this.cc = cc;
    this.node = node;
    this.numdelims = numdelims;
    this.origdelims = numdelims;
    this.canOpen = canOpen;
    this.canClose = canClose;
    this.previous = previous;
  }
}

/**
 * One entry of the bracket stack: an unmatched `[` or `![`.
 *
 * **Example** (Open a link bracket)
 *
 * ```ts
 * import { makeInlineNode } from "@beep/markdown/internal/inlineNode";
 * import { Bracket } from "@beep/markdown/internal/inlineTypes";
 *
 * const bracket = new Bracket(makeInlineNode("text", 0, 1, "["), 0, false, undefined, undefined);
 * console.log(bracket.active, bracket.bracketAfter) // true false
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Bracket {
  /**
   * Cleared when an enclosing link forms — links do not nest.
   *
   * @since 0.0.0
   */
  active = true;
  /**
   * Whether another bracket opened after this one.
   *
   * @since 0.0.0
   */
  bracketAfter = false;
  /**
   * Whether this opener was `![`.
   *
   * @since 0.0.0
   */
  readonly image: boolean;
  /**
   * Where the bracket's content starts.
   *
   * @since 0.0.0
   */
  readonly index: number;
  /**
   * The text node carrying the bracket.
   *
   * @since 0.0.0
   */
  readonly node: InlineNode;
  /**
   * The stack entry below this one.
   *
   * @since 0.0.0
   */
  readonly previous: Bracket | undefined;
  /**
   * The delimiter stack top when this bracket opened.
   *
   * @since 0.0.0
   */
  readonly previousDelimiter: Delimiter | undefined;

  constructor(
    node: InlineNode,
    index: number,
    image: boolean,
    previous: Bracket | undefined,
    previousDelimiter: Delimiter | undefined
  ) {
    this.node = node;
    this.index = index;
    this.image = image;
    this.previous = previous;
    this.previousDelimiter = previousDelimiter;
  }
}

/**
 * The cursor, output list and stacks an inline construct drives — upstream's
 * `InlineParser` object, as the contract its constructs see.
 *
 * **Details**
 *
 * Positions are the reason the source is here: every local index maps back
 * through the segment table to an absolute source offset, so a node built
 * here is positioned in the ORIGINAL document rather than in the stripped,
 * tab-expanded content the block pass accumulated.
 *
 * Abstract engine state (D-42): the parser is the one implementation, and a
 * test may stand in for it with any value of the same shape.
 *
 * @category models
 * @since 0.0.0
 */
export abstract class InlineScanner {
  /**
   * Push a bracket opener.
   *
   * @since 0.0.0
   */
  abstract readonly addBracket: {
    (node: InlineNode, index: number, image: boolean): void;
    (index: number, image: boolean): (node: InlineNode) => void;
  };
  /**
   * Append a literal text node spanning local `[from, to)`.
   *
   * @since 0.0.0
   */
  abstract readonly appendText: {
    (value: string, from: number, to: number): InlineNode;
    (from: number, to: number): (value: string) => InlineNode;
  };
  /**
   * The bracket stack top.
   *
   * @since 0.0.0
   */
  abstract brackets: Bracket | undefined;
  /**
   * The start of the next backtick run of exactly `length`, at or after
   * `from`, or `undefined` when there is none.
   *
   * **Details**
   *
   * Backed by an index built once per subject. Walking run by run is
   * quadratic on a document of thousands of distinct-length runs, which is
   * precisely the vendored "backticks" pathological case.
   *
   * @since 0.0.0
   */
  abstract readonly closingBacktickRun: {
    (from: number, length: number): number | undefined;
    (length: number): (from: number) => number | undefined;
  };
  /**
   * The delimiter stack top.
   *
   * @since 0.0.0
   */
  abstract delimiters: Delimiter | undefined;
  /**
   * The case-folded labels a GFM footnote reference may form against.
   *
   * **Details**
   *
   * A set rather than a map to the definitions: a footnote definition's own
   * children are inline-parsed, so an index holding materialized nodes could
   * not exist yet (`blockParser.collectReferences` carries the full reason).
   * Empty under `commonmark`, which never forms a footnote reference.
   *
   * @since 0.0.0
   */
  abstract readonly footnoteLabels: HashSet.HashSet<string>;
  /**
   * The cursor.
   *
   * @since 0.0.0
   */
  abstract pos: number;
  /**
   * The definitions a reference may resolve against.
   *
   * @since 0.0.0
   */
  abstract readonly refmap: HashMap.HashMap<string, Definition>;
  /**
   * The content being parsed — a leaf block's trimmed text.
   *
   * @since 0.0.0
   */
  abstract readonly subject: string;

  /**
   * Append a node to the output list.
   *
   * @since 0.0.0
   */
  abstract append(node: InlineNode): void;
  /**
   * Spend every link opener still on the stack — links do not nest.
   *
   * **Details**
   *
   * A method rather than a loop at the call site because it keeps an O(1)
   * fast path: image openers accumulate without ever being closed, and
   * walking past them on every link close is quadratic.
   *
   * @since 0.0.0
   */
  abstract deactivateLinkOpeners(): void;
  /**
   * Whether `needle` occurs at or after the cursor.
   *
   * **Details**
   *
   * Memoized per needle: once a search from some position finds nothing,
   * nothing later can either, so a construct whose closing sequence is
   * missing entirely fails in constant time after the first look. Without
   * it, a document of 300k unclosed `<!--` costs one full scan per opener.
   *
   * @since 0.0.0
   */
  abstract hasAhead(needle: string): boolean;
  /**
   * The last node appended, if any.
   *
   * @since 0.0.0
   */
  abstract lastChild(): InlineNode | undefined;
  /**
   * Match `pattern` AT the cursor, advancing past it on success.
   *
   * @since 0.0.0
   */
  abstract match(pattern: RegExp): string | undefined;
  /**
   * Scan forward for `pattern`, advancing past it on success.
   *
   * **Details**
   *
   * Almost nothing wants this — a construct asks whether it begins at the
   * cursor, and a match found further along is not one.
   *
   * @since 0.0.0
   */
  abstract matchAhead(pattern: RegExp): string | undefined;
  /**
   * The UTF-16 unit at the cursor as a one-character string, or `""` at the
   * end.
   *
   * **Details**
   *
   * A string rather than a char code: an index read allocates nothing, where
   * a code needs an `Option`-returning `effect/String` call per character.
   * Constructs compare it against their trigger characters directly.
   *
   * @since 0.0.0
   */
  abstract peek(): string;
  /**
   * Run the emphasis algorithm down to `stackBottom`.
   *
   * @since 0.0.0
   */
  abstract processEmphasis(stackBottom: Delimiter | undefined): void;
  /**
   * Pop the top bracket opener.
   *
   * @since 0.0.0
   */
  abstract removeBracket(): void;
  /**
   * Drop `delimiter` from the stack.
   *
   * @since 0.0.0
   */
  abstract removeDelimiter(delimiter: Delimiter): void;
  /**
   * Strip trailing spaces from the trailing text node, pulling its end back,
   * and report how many were removed. Removes the node if nothing survives.
   *
   * @since 0.0.0
   */
  abstract trimTrailingSpaces(): number;
  /**
   * Take `count` characters back off the end of the output — cmark-gfm's
   * `cmark_node_unput`, which its `url_match` uses to reclaim the scheme it
   * already emitted as text before the `:` triggered.
   *
   * **Details**
   *
   * Refuses (leaving the output untouched) unless those characters are all
   * literal text: a run that came out of an entity or an escape is not the
   * source it looks like, and a construct that cannot reclaim it must not
   * pretend it did.
   *
   * @since 0.0.0
   */
  abstract unputText(count: number): boolean;
}

/**
 * One inline construct: upstream's `parse*` methods, one per module.
 *
 * **Example** (Declare a construct on a trigger character)
 *
 * ```ts
 * import { InlineConstruct } from "@beep/markdown/internal/inlineTypes";
 *
 * const never = new InlineConstruct("never", ["?"], () => false);
 * console.log(never.name, never.triggers) // never [ '?' ]
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class InlineConstruct {
  /**
   * The construct's name, for diagnostics and precedence tests.
   *
   * @since 0.0.0
   */
  readonly name: string;
  /**
   * Try to parse at the cursor; `false` leaves the cursor untouched.
   *
   * @since 0.0.0
   */
  readonly parse: (scanner: InlineScanner) => boolean;
  /**
   * The characters that give this construct a chance. A construct with no
   * triggers is the fallback that consumes ordinary text.
   *
   * @since 0.0.0
   */
  readonly triggers: ReadonlyArray<string>;

  constructor(name: string, triggers: ReadonlyArray<string>, parse: (scanner: InlineScanner) => boolean) {
    this.name = name;
    this.triggers = triggers;
    this.parse = parse;
  }
}

/**
 * A dialect: a trigger table, the text fallback, and its postprocess passes.
 *
 * **Details**
 *
 * The trigger table is a read-only record keyed by character, built once per
 * dialect, so the per-character dispatch is a direct property read — no
 * `Option` and no hashing per character.
 *
 * **Example** (Declare a dialect with no triggers)
 *
 * ```ts
 * import { InlineConstruct, InlineDialect } from "@beep/markdown/internal/inlineTypes";
 *
 * const text = new InlineConstruct("text", [], () => false);
 * const dialect = new InlineDialect({}, text, []);
 * console.log(dialect.byTrigger["*"]) // undefined
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class InlineDialect {
  /**
   * The constructs each trigger character tries, in precedence order.
   *
   * @since 0.0.0
   */
  readonly byTrigger: Readonly<Record<string, ReadonlyArray<InlineConstruct>>>;
  /**
   * Passes run over the finished node list, before it is materialized —
   * cmark-gfm's `postprocess` extension hook.
   *
   * **Details**
   *
   * A construct belongs here rather than in the trigger table when it has to
   * see text the cursor has already gone past: GFM's email autolinks scan
   * backwards from an `@`, which is only safe once the delimiter stack that
   * text may be pinned to has been spent.
   *
   * @since 0.0.0
   */
  readonly postprocess: ReadonlyArray<(root: InlineNode) => void>;
  /**
   * The fallback that consumes a run of ordinary characters.
   *
   * @since 0.0.0
   */
  readonly text: InlineConstruct;

  constructor(
    byTrigger: Readonly<Record<string, ReadonlyArray<InlineConstruct>>>,
    text: InlineConstruct,
    postprocess: ReadonlyArray<(root: InlineNode) => void>
  ) {
    this.byTrigger = byTrigger;
    this.text = text;
    this.postprocess = postprocess;
  }
}
