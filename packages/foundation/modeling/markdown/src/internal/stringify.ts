// Canonical markdown serialization: an mdast-shaped tree in, markdown source
// out. Original code (nothing here is ported verbatim); commonmark.js's
// excluded render/commonmark.js and mdast-util-to-markdown informed the
// escaping approach as prior art, but the operational authority is the
// corpus-wide re-parse property in
// `__test__/e2e/stringify-roundtrip.e2e.test.ts`: emitted text must re-parse
// to a render-equivalent document.
//
// THE CANONICAL DEFAULTS TABLE — fidelity fields win when present; when
// absent these spellings apply:
//
//   heading         ATX (`#` × depth); setext only via fidelity, depth <= 2
//   emphasis        `*`     strong  `**`    (flipped to `_` at run junctions)
//   bullet list     `-`     ordered delimiter `.`   start `1`
//   list spread     absent reads as tight
//   code            absent `fenceChar` reads as INDENTED (the node contract:
//                   absence is how fenced and indented are told apart), with
//                   a representability escape to a backtick fence when the
//                   value has a lang/meta, is empty, or has a blank first or
//                   last line
//   fence length    max(3, fidelity, longest interior run + 1)
//   thematic break  `***` (never `---`, which could read as setext under a
//                   lazy paragraph or as frontmatter at offset 0)
//   hard break      backslash
//   table align     `---` / `:--` / `--:` / `:-:`, `---` when unknown
//   frontmatter     `---` yaml, `+++` toml, `---json` json; closed by `---`
//                   (`+++` for toml)
//
// Escaping strategy: an always-escape set for inline text (backslash,
// backtick, `*`, `[`, `]`, `<`, `~`, `|`) plus line-start escapes (`#`, `>`,
// `+`, `-`, `=`, and ordered-list-marker digit runs) applied at the start of
// the block and after every emitted newline. Three characters escape only
// where they could actually bind, so `parse ∘ stringify` is the identity on
// ordinary prose: `_` is raw when both neighbours in the same text value are
// Unicode alphanumerics (an intraword `_` can neither open nor close
// emphasis; a value boundary counts as not alphanumeric, so an edge `_` stays
// escaped whatever the sibling is); `&` is raw unless the rest of the value
// is entity-shaped (the engine's own ENTITY grammar, any name-shaped run —
// the entity map is not consulted), with a value-final `&` escaped only when
// a sibling follows; `>` is escaped only at a line start, the one place it
// binds. In a heading, `#` is escaped only at the head of a `#` run that a
// space or the value start precedes and nothing but whitespace follows to the
// value end — the closing-sequence shape — with a following sibling treated
// as content that may still be blank, so the escape stays.
// Autolink defense under gfm: a `.` right after a boundary-preceded `www` and
// a `:` right after a scheme word (http/https/ftp/mailto/xmpp) are escaped so
// raw-source literal scanners cannot fire; escapes decode away, so the text
// is unchanged. Email-shaped plain text is a RECORDED LIMITATION: the email
// matcher is a postprocess over decoded text,
// so no escape spelling survives to defeat it.
//
// Unrepresentable shapes (documented, synthesized-tree-only — the parser
// never produces them): a tight list whose item holds multiple blocks, two
// adjacent `Delete` siblings, a `Break` inside a heading or table cell
// (serialized as a space), text lines starting with 4+ spaces, and a
// `Frontmatter` node anywhere but the head of `Root`.
//
// Depth guard: serialization recurses over the tree, so the shared
// `MAX_NESTING_DEPTH` cap applies (a decoded hostile tree must trip a typed
// guard, never a RangeError). Blocks and inlines share one counter.

import { $MarkdownId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema/LiteralKit";
import { replaceAllWith } from "@beep/utils/Str";
import * as A from "effect/Array";
import { dual, pipe } from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { GuardExceeded } from "./carriers.ts";
import { MAX_NESTING_DEPTH } from "./limits.ts";
import { ENTITY } from "./unescape.ts";
import type {
  Code,
  Definition,
  Emphasis,
  EmphasisChar,
  FenceChar,
  FlowContent,
  FootnoteDefinition,
  Frontmatter,
  Heading,
  List,
  ListItem,
  MdxJsxAttributeContent,
  MdxJsxFlowElement,
  MdxJsxTextElement,
  MdxjsEsm,
  Paragraph,
  PhrasingContent,
  ReferenceType,
  Root,
  Strong,
  Table,
  TableAlign,
} from "./nodes.ts";

/**
 * How inline content is being assembled.
 */
interface InlineContext {
  /**
   * Inside a heading: a `#` could read as the closing sequence.
   */
  readonly inHeading: boolean;
  /**
   * Inside a table cell: `|` must not survive unescaped.
   */
  readonly inTable: boolean;
  /**
   * No newlines representable (heading, table cell): breaks become spaces.
   */
  readonly singleLine: boolean;
}

const FLOW_CONTEXT: InlineContext = { singleLine: false, inTable: false, inHeading: false };
const HEADING_CONTEXT: InlineContext = { singleLine: true, inTable: false, inHeading: true };
const CELL_CONTEXT: InlineContext = { singleLine: true, inTable: true, inHeading: false };

/**
 * A character reference at the head of the string: the engine's own grammar.
 */
const reEntityAhead = new RegExp(`^${ENTITY}`, "i");

const reAlphanumeric = /[\p{L}\p{N}]/u;

const ORDERED_MARKER = /^\d{1,9}[.)]/;

/**
 * The serializer's mutable state.
 */
interface StringifyState {
  depth: number;
  /**
   * MDX JSX flow-element nesting depth — how many `mdxJsxFlowElement`
   * ancestors enclose the current emission, counted from the nearest
   * blockquote or list item (whose own continuation prefixes take over
   * indentation; the oracle's `inferDepth` break). Drives the two-space
   * child indentation inside flow elements.
   */
  jsxDepth: number;
  /**
   * Whether the tree contains any MDX node. MDX makes `{` significant in
   * text, so text escaping defends it — but only then, keeping non-MDX
   * trees byte-identical to the published canonical form.
   */
  readonly mdx: boolean;
}

const guard: {
  (state: StringifyState, node: { position: { start: { offset: number } } }): void;
  (node: { position: { start: { offset: number } } }): (state: StringifyState) => void;
} = dual(2, (state: StringifyState, node: { position: { start: { offset: number } } }): void => {
  state.depth += 1;
  if (state.depth > MAX_NESTING_DEPTH) {
    throw GuardExceeded.new("NestingDepthExceeded", MAX_NESTING_DEPTH, state.depth, node.position.start.offset);
  }
});

const unguard = (state: StringifyState): void => {
  state.depth -= 1;
};

// --- inline text escaping ---------------------------------------------------

/**
 * The UTF-16 code unit at `index` as a one-character string, or `""` past
 * either end of `value`. Every per-character read in this module goes through
 * here: an indexed read, never an Option-returning `String` call, and never a
 * raw `undefined` reaching a `RegExp` test (which would test "undefined").
 */
const charAt: {
  (value: string, index: number): string;
  (index: number): (value: string) => string;
} = dual(2, (value: string, index: number): string => value[index] ?? "");

/**
 * The offset of the next line feed at or after `from`, or `-1`.
 */
const reLineFeed = /\n/g;
const lineFeedFrom: {
  (value: string, from: number): number;
  (from: number): (value: string) => number;
} = dual(2, (value: string, from: number): number => {
  reLineFeed.lastIndex = from;
  const match = reLineFeed.exec(value);
  return match === null ? -1 : match.index;
});

/**
 * Whether `value[index]` ends a `www` run preceded by a word boundary.
 */
const isWwwDot: {
  (value: string, index: number): boolean;
  (index: number): (value: string) => boolean;
} = dual(
  2,
  (value: string, index: number): boolean =>
    Str.toLowerCase(Str.slice(Math.max(0, index - 3), index)(value)) === "www" &&
    !reAlphanumeric.test(charAt(value, index - 4))
);

const reAsciiLetter = /[a-zA-Z]/;

const reSchemeWord = /^(?:https?|ftp|mailto|xmpp)$/;

/**
 * Whether the run of letters ending at `value[index]` is a scheme word.
 */
const isSchemeColon: {
  (value: string, index: number): boolean;
  (index: number): (value: string) => boolean;
} = dual(2, (value: string, index: number): boolean => {
  let start = index;
  while (start > 0 && reAsciiLetter.test(charAt(value, start - 1))) start -= 1;
  return reSchemeWord.test(Str.toLowerCase(Str.slice(start, index)(value)));
});

/**
 * Whether `value[index]` is a Unicode letter or number (past either end is not).
 */
const isAlphanumericAt: {
  (value: string, index: number): boolean;
  (index: number): (value: string) => boolean;
} = dual(2, (value: string, index: number): boolean => reAlphanumeric.test(charAt(value, index)));

const reHashRun = /#*/y;
const reInlineBlankRun = /[ \t\n]*/y;
const reBlankToEnd = /^[ \t\n]*$/;
const reHashThenBlankToEnd = /^#*[ \t\n]*$/;

/**
 * Whether the `#` at `value[index]` heads a run that would read as an ATX
 * closing sequence: preceded by whitespace or the value start, and followed
 * by nothing but whitespace to the end of the contiguous text (this value
 * plus `followingText`). A non-text sibling after that may contribute only
 * blank content, so it keeps the escape (conservative).
 */
const isClosingHashRun: {
  (value: string, index: number, followingText: string, nonTextFollows: boolean): boolean;
  (index: number, followingText: string, nonTextFollows: boolean): (value: string) => boolean;
} = dual(4, (value: string, index: number, followingText: string, nonTextFollows: boolean): boolean => {
  const before = charAt(value, index - 1);
  if (before !== "" && before !== " " && before !== "\t") return false;
  if (nonTextFollows) return true;
  reHashRun.lastIndex = index;
  reHashRun.test(value);
  // A run reaching the value end continues into the following text.
  if (reHashRun.lastIndex === value.length) return reHashThenBlankToEnd.test(followingText);
  reInlineBlankRun.lastIndex = reHashRun.lastIndex;
  reInlineBlankRun.test(value);
  return reInlineBlankRun.lastIndex === value.length && reBlankToEnd.test(followingText);
});

/**
 * A run that a later sibling could still complete into a character reference.
 */
const reEntityPrefix = /^&[#a-z0-9]*$/i;

/**
 * A character reference at a position: the engine's own grammar.
 */
const reEntityAt = new RegExp(ENTITY, "yi");

/**
 * An entity-shaped run at a position (what a character reference may begin with).
 */
const reEntityPrefixAt = /&[#a-zA-Z0-9]*/y;

/**
 * Whether the `&` at `value[index]` binds as a character reference, tested
 * against the contiguous text that will actually be emitted (Text("&a") +
 * Text("mp;") must not fuse). A run a non-text sibling could still complete
 * (`&`, `&am`, `&#12`) is escaped, since that sibling's bytes are unknowable
 * here. Only an entity-shaped run reaching the value end can depend on the
 * following text, so the concatenation is built at most once per value.
 */
const isEntityShaped: {
  (value: string, index: number, followingText: string, nonTextFollows: boolean): boolean;
  (index: number, followingText: string, nonTextFollows: boolean): (value: string) => boolean;
} = dual(4, (value: string, index: number, followingText: string, nonTextFollows: boolean): boolean => {
  reEntityAt.lastIndex = index;
  if (reEntityAt.test(value)) return true;
  reEntityPrefixAt.lastIndex = index;
  reEntityPrefixAt.test(value);
  if (reEntityPrefixAt.lastIndex !== value.length) return false;
  const ahead = Str.slice(index)(value) + followingText;
  return reEntityAhead.test(ahead) || (nonTextFollows && reEntityPrefix.test(ahead));
});

/**
 * An ordered-list marker at a position.
 */
const reOrderedMarkerAt = /\d{1,9}[.)]/y;

/**
 * The backslash-escaped spelling of an ordered-list marker: `1.` reads `1\.`.
 */
const escapeOrderedMarker = (marker: string): string => `${Str.slice(0, -1)(marker)}\\${Str.slice(-1)(marker)}`;

/**
 * The fields every per-character escape reads: the value being escaped, its
 * container context and the contiguous text around it.
 */
interface EscapeInput {
  readonly context: InlineContext;
  readonly followingText: string;
  readonly mdx: boolean;
  readonly nonTextFollows: boolean;
  readonly value: string;
}

/**
 * The emission cursor shared by the canonical and the literal escapers
 * (mutable engine state, D-42): the output so far, whether it sits at a line
 * start, and the index of the character being escaped.
 */
class EscapeCursor implements EscapeInput {
  out = "";
  index = 0;
  lineStart: boolean;
  // The last two (never empty) pushes: together they hold the output's last
  // two characters, so a newline's hard-break check never reads `out`, whose
  // rope a read would flatten.
  previousPush = "";
  lastPush = "";
  readonly context: InlineContext;
  readonly followingText: string;
  readonly mdx: boolean;
  readonly nonTextFollows: boolean;
  readonly value: string;

  constructor(input: EscapeInput, atLineStart: boolean) {
    this.context = input.context;
    this.followingText = input.followingText;
    this.mdx = input.mdx;
    this.nonTextFollows = input.nonTextFollows;
    this.value = input.value;
    this.lineStart = atLineStart;
  }

  /** Append `text`, recording whether the emission now sits at a line start. */
  push(text: string, lineStart: boolean): void {
    this.out += text;
    this.lineStart = lineStart;
    this.previousPush = this.lastPush;
    this.lastPush = text;
  }

  /**
   * Emit the run of characters up to `end` that need no escape here, in one
   * append, and move the cursor to its last character.
   */
  pushRun(end: number): void {
    this.push(Str.slice(this.index, end)(this.value), false);
    this.index = end - 1;
  }

  /**
   * The offset where the next character `special` matches (a global regex)
   * sits at or after the cursor, or the value's end.
   */
  nextSpecial(special: RegExp): number {
    special.lastIndex = this.index;
    const match = special.exec(this.value);
    return match === null ? this.value.length : match.index;
  }

  /**
   * Whether two spaces end the contiguous emission — the text before this
   * value (its last two characters are `precedingTail`) followed by `out` —
   * so a raw newline here would read as a hard break.
   */
  endsWithTwoSpaces(precedingTail: string): boolean {
    const outTail = lastTwo(this.lastPush.length >= 2 ? this.lastPush : this.previousPush + this.lastPush);
    return Str.endsWith("  ")(precedingTail + outTail);
  }

  /** Whether the newline being escaped touches another newline within this value. */
  adjacentNewline(): boolean {
    return charAt(this.value, this.index - 1) === "\n" || charAt(this.value, this.index + 1) === "\n";
  }

  /**
   * Emit a newline: a space in a single-line container, the inert numeric
   * reference where a raw newline would open a blank line, else itself.
   */
  newline(blankHazard: boolean): void {
    if (this.context.singleLine) {
      this.push(" ", false);
    } else if (blankHazard) {
      this.push("&#10;", false);
    } else {
      this.push("\n", true);
    }
  }

  /**
   * Leading whitespace at a line start would read as indentation (four
   * columns make an indented code block); the numeric reference is inert.
   * Returns whether the character was emitted.
   */
  leadingWhitespace(char: string): boolean {
    const reference = LEADING_WHITESPACE_REFERENCE[char];
    if (reference !== undefined) {
      this.push(reference, false);
    }
    return reference !== undefined;
  }

  /** The ordered-list marker starting at the current index, if any. */
  orderedMarker(): string | undefined {
    reOrderedMarkerAt.lastIndex = this.index;
    return reOrderedMarkerAt.exec(this.value)?.[0];
  }

  /** Emit an ordered-list marker escaped, consuming it whole. */
  pushOrderedMarker(marker: string): void {
    this.push(escapeOrderedMarker(marker), false);
    this.index += marker.length - 1;
  }
}

const LEADING_WHITESPACE_REFERENCE: Readonly<Record<string, string>> = { "\t": "&#9;", " ": "&#32;" };

/**
 * Characters escaped wherever they appear in inline text (direct property
 * lookup per character, never a hashed collection probe).
 */
const ALWAYS_ESCAPE: Readonly<Record<string, true>> = {
  "\\": true,
  "`": true,
  "*": true,
  "[": true,
  "]": true,
  "<": true,
  "~": true,
  "|": true,
};

/**
 * Line-start characters that could open a block construct.
 */
const LINE_START_ESCAPE: Readonly<Record<string, true>> = {
  "#": true,
  ">": true,
  "+": true,
  "-": true,
  "=": true,
  "~": true,
  "`": true,
};

/**
 * The canonical escapes that depend on where a character sits: each returns
 * the spelling of the character at the cursor's index.
 */
const CONTEXTUAL_ESCAPE: Readonly<Record<string, (cursor: EscapeCursor) => string>> = {
  // MDX makes `{` open an expression anywhere in text (the oracle's unsafe
  // set: `{` in phrasing and at breaks); `<` is already in the always-escape
  // set. Only trees carrying MDX nodes pay this escape, so non-MDX output is
  // byte-identical to the canonical table.
  "{": (cursor) => (cursor.mdx ? "\\{" : "{"),
  // The intraword-underscore rule: between two alphanumerics an `_` can
  // neither open nor close emphasis, so it stays raw.
  _: (cursor) =>
    isAlphanumericAt(cursor.value, cursor.index - 1) && isAlphanumericAt(cursor.value, cursor.index + 1) ? "_" : "\\_",
  "&": (cursor) =>
    isEntityShaped(cursor.value, cursor.index, cursor.followingText, cursor.nonTextFollows) ? "\\&" : "&",
  "#": (cursor) =>
    cursor.context.inHeading &&
    isClosingHashRun(cursor.value, cursor.index, cursor.followingText, cursor.nonTextFollows)
      ? "\\#"
      : "#",
  ".": (cursor) => (isWwwDot(cursor.value, cursor.index) ? "\\." : "."),
  ":": (cursor) => (isSchemeColon(cursor.value, cursor.index) ? "\\:" : ":"),
};

/**
 * The canonical spelling of one inline character away from a line start.
 */
const canonicalInlineChar = (cursor: EscapeCursor, char: string): string => {
  if (ALWAYS_ESCAPE[char] === true) return `\\${char}`;
  const contextual = CONTEXTUAL_ESCAPE[char];
  return contextual === undefined ? char : contextual(cursor);
};

/**
 * The canonical line-start escapes: indentation, an ordered-list marker, a
 * block-opening character. Returns whether the character was emitted.
 */
const canonicalLineStart = (cursor: EscapeCursor, char: string): boolean => {
  if (cursor.leadingWhitespace(char)) return true;
  const marker = cursor.orderedMarker();
  if (marker !== undefined) {
    cursor.pushOrderedMarker(marker);
    return true;
  }
  if (LINE_START_ESCAPE[char] === true) {
    cursor.push(`\\${char}`, false);
    return true;
  }
  return false;
};

/**
 * A soft break survives as a plain newline, INCLUDING at a Text value's
 * boundary (index 0 or the last index) — that is exactly where a line wraps
 * beside a non-text inline (inlineCode, strong, emphasis, link), and the
 * neighbouring inline keeps the paragraph continuous, so a literal `\n` there
 * cannot open a block. Some cases still have no raw spelling and keep the
 * numeric reference: a newline adjacent to another newline WITHIN this value
 * (a literal blank line, which would end the paragraph on re-parse), and a
 * newline that lands at an already-fresh physical line (`lineStart` true —
 * block start, or immediately after a hard break) — emitting it there would
 * open a second, BLANK line, which is the same "blank line ends the block"
 * hazard as the adjacent case, just arriving from the previous sibling
 * instead of from this value. Single-line contexts have no newline spelling
 * at all. Trailing emitted spaces must not turn a soft newline into a hard
 * break, including across Text siblings.
 */
const canonicalNewline = (cursor: EscapeCursor, precedingText: string): void => {
  const hardBreak = cursor.endsWithTwoSpaces(lastTwo(precedingText));
  cursor.newline(cursor.adjacentNewline() || cursor.lineStart || hardBreak);
};

/**
 * The characters a canonical escape may change away from a line start: the
 * line terminators, the always-escape set and the contextual escapes. Every
 * other character is emitted as itself, so runs of them are appended whole.
 */
const reCanonicalSpecial = /[\r\n\\`*[\]<~|{_&#.:]/g;

/** The same characters as `reCanonicalSpecial`, for a direct per-character lookup. */
const CANONICAL_SPECIAL: Readonly<Record<string, true>> = {
  ...ALWAYS_ESCAPE,
  "\r": true,
  "\n": true,
  "{": true,
  _: true,
  "&": true,
  "#": true,
  ".": true,
  ":": true,
};

/**
 * Escape the character at the cursor's index canonically, or append the run
 * of characters up to the next one that may need an escape.
 */
const canonicalStep = (cursor: EscapeCursor, precedingText: string): void => {
  const char = charAt(cursor.value, cursor.index);
  if (!cursor.lineStart && CANONICAL_SPECIAL[char] !== true) {
    cursor.pushRun(cursor.nextSpecial(reCanonicalSpecial));
  } else if (char === "\r") {
    cursor.push("&#13;", false);
  } else if (char === "\n") {
    canonicalNewline(cursor, precedingText);
  } else if (!cursor.lineStart || !canonicalLineStart(cursor, char)) {
    cursor.push(canonicalInlineChar(cursor, char), false);
  }
};

/**
 * Escape one text value into `out`, tracking line starts. Returns whether the
 * emission ended at a line start. `followingText` is the concatenated value
 * of the contiguous text siblings after this one (the parser never splits a
 * text run, but a synthesized tree may), and `nonTextFollows` says whether a
 * non-text inline comes after those; together they decide the value-end
 * cases (`&`, and `#` in a heading) against what will actually be emitted.
 */
const escapeText: {
  (
    value: string,
    context: InlineContext,
    atLineStart: boolean,
    mdx: boolean,
    followingText: string,
    nonTextFollows: boolean,
    precedingText?: string
  ): { text: string; atLineStart: boolean };
  (
    context: InlineContext,
    atLineStart: boolean,
    mdx: boolean,
    followingText: string,
    nonTextFollows: boolean,
    precedingText?: string
  ): (value: string) => { text: string; atLineStart: boolean };
} = dual(
  (args) => P.isString(args[0]),
  (
    value: string,
    context: InlineContext,
    atLineStart: boolean,
    mdx: boolean,
    followingText: string,
    nonTextFollows: boolean,
    precedingText = ""
  ): { text: string; atLineStart: boolean } => {
    const cursor = new EscapeCursor({ value, context, mdx, followingText, nonTextFollows }, atLineStart);
    for (; cursor.index < value.length; cursor.index += 1) {
      canonicalStep(cursor, precedingText);
    }
    return { text: cursor.out, atLineStart: cursor.lineStart };
  }
);

// --- literal text (`escapeStyle: "literal"`) ---------------------------------
//
// The caller vouches the value is already safe markdown source, so every
// escape aimed at the INLINE phase is dropped. What stays is what defends the
// BLOCK phase — the structure around the text, decided before inlines are
// parsed: newlines (blank lines end a paragraph; single-line containers have
// none), line-start block openers and leading whitespace, the heading closing
// sequence, and the table cell's pipes (cells are split before inline
// parsing). MDX's `{`/`<` also stay: MDX reads a stray one as a syntax error.
// Kept apart from `escapeText` so the canonical path is untouched byte for
// byte.

/**
 * Space or tab — the whitespace a list marker or ATX run must be followed by.
 */
const isSpaceOrTab = (char: string): boolean => char === " " || char === "\t";

/**
 * A thematic-break or setext-shaped run of each marker: the marker or
 * spaces/tabs only.
 */
const MARKER_RUN: Readonly<Record<string, RegExp>> = {
  "-": /^[- \t]+$/,
  "*": /^[* \t]+$/,
  _: /^[_ \t]+$/,
};

/**
 * An open fence line of one fence character only, which more text could
 * complete.
 */
const FENCE_ONLY: Readonly<Record<string, RegExp>> = { "`": /^`+$/, "~": /^~+$/ };

/**
 * Only the characters a GFM delimiter row is made of (re2c's `spacechar` included).
 */
const reDelimiterRowShaped = /^[-:| \t\v\f]+$/;

/**
 * The context `literalLineOpensBlock` judges a line in.
 */
interface LiteralLine {
  readonly char: string;
  readonly line: string;
  readonly open: boolean;
}

/**
 * Whether an ATX heading run opens the line: 1-6 `#` then space, tab or end.
 */
const opensAtxHeading = ({ line }: LiteralLine): boolean => {
  let length = 1;
  while (length < 6 && charAt(line, length) === "#") length += 1;
  return length === line.length || isSpaceOrTab(charAt(line, length));
};

/**
 * A fence is 3+ of either; an open line of only 1-2 could be completed.
 */
const opensFence = ({ char, line, open }: LiteralLine): boolean =>
  Str.startsWith(Str.repeat(3)(char))(line) || (open && FENCE_ONLY[char]?.test(line) === true);

/**
 * A bullet marker followed by space, tab or the line end.
 */
const opensBullet = ({ char, line }: LiteralLine): boolean =>
  char !== "_" && (line.length === 1 || isSpaceOrTab(charAt(line, 1)));

/**
 * A thematic break: a run of the marker with at least three of it, or an
 * open run that more text could complete.
 */
const opensThematicBreak = ({ char, line, open }: LiteralLine): boolean =>
  MARKER_RUN[char]?.test(line) === true && (open || Str.split(line, char).length - 1 >= 3);

/**
 * `---`/`+++` open frontmatter at the document head (`---json` too). A dash
 * line may also be a setext underline or a delimiter row; the delimiter-row
 * shape covers both.
 */
const opensFrontmatterOrDashLine = ({ char, line }: LiteralLine): boolean =>
  ((char === "-" || char === "+") && Str.startsWith(Str.repeat(3)(char))(line)) ||
  (char === "-" && reDelimiterRowShaped.test(line));

/**
 * Whether a literal line starting with `line` can open a block, so its first
 * character must be escaped. `line` is the text known to be on the line —
 * the value up to its next newline, then the following text siblings — and
 * `open` says the line may carry more than that (no newline ended it).
 * Beyond the known text sits either the end of the line or content this
 * function cannot see (a non-text sibling, a parent's closing delimiter), so
 * a marker that needs "space, tab or end of line" after it is escaped when
 * it reaches the end of `line`. Every test errs toward escaping: an extra
 * backslash is inert, a missing one changes the document.
 */
const literalLineOpensBlockDispatch = Match.type<LiteralLine>().pipe(
  Match.when({ char: Match.is(">", "<", "[", "|", ":") }, () => true),
  Match.when({ char: "#" }, opensAtxHeading),
  Match.when({ char: Match.is("`", "~") }, opensFence),
  // A setext underline, kept escaped even on a paragraph's first line.
  Match.when({ char: "=" }, ({ line }) => /^=+[ \t]*$/.test(line)),
  Match.when(
    { char: Match.is("+", "-", "*", "_") },
    (input) => opensBullet(input) || opensThematicBreak(input) || opensFrontmatterOrDashLine(input)
  ),
  Match.orElse(() => false)
);

const literalLineOpensBlock: {
  (line: string, open: boolean): boolean;
  (open: boolean): (line: string) => boolean;
} = dual(2, (line: string, open: boolean): boolean =>
  literalLineOpensBlockDispatch({ char: charAt(line, 0), line, open })
);

/**
 * ASCII punctuation: what a backslash escapes, so `\x` is one cell character.
 */
const reAsciiPunctuation = /[!-/:-@[-`{-~]/;

/**
 * The text known to sit on the line starting at the cursor: the value up to
 * its next newline, or — when no newline ends it — the value's rest plus the
 * following text up to its first newline, `open` when even that one ends
 * unterminated.
 */
const literalLineAt = (cursor: EscapeCursor): { readonly line: string; readonly open: boolean } => {
  const lineEnd = lineFeedFrom(cursor.value, cursor.index);
  if (lineEnd !== -1) {
    return { line: Str.slice(cursor.index, lineEnd)(cursor.value), open: false };
  }
  const followingEnd = lineFeedFrom(cursor.followingText, 0);
  const following = followingEnd === -1 ? cursor.followingText : Str.slice(0, followingEnd)(cursor.followingText);
  return { line: Str.slice(cursor.index)(cursor.value) + following, open: followingEnd === -1 };
};

/**
 * The literal line-start escapes: indentation, an ordered-list marker that
 * space, tab or the line end follows, a block-opening line. Returns whether
 * the character was emitted.
 */
const literalLineStart = (cursor: EscapeCursor, char: string): boolean => {
  if (cursor.leadingWhitespace(char)) return true;
  const { line, open } = literalLineAt(cursor);
  // The marker is read off the whole known line, so one split across a text
  // sibling boundary still escapes (and consumes) as a unit.
  const marker = ORDERED_MARKER.exec(line)?.[0];
  if (marker !== undefined) {
    const after = charAt(line, marker.length);
    if (after === "" || isSpaceOrTab(after)) {
      cursor.pushOrderedMarker(marker);
      return true;
    }
    return false;
  }
  if (literalLineOpensBlock(line, open)) {
    cursor.push(`\\${char}`, false);
    return true;
  }
  return false;
};

/**
 * An escape pair is atomic — the cell scanner consumes it whole — so an
 * already-escaped `\|` passes through untouched. A value-final backslash with
 * more content after it, in any container, would pair with that content's
 * first character: the backtick of inline code, or a table cell's `\|`,
 * freeing the pipe.
 */
const literalBackslash = (cursor: EscapeCursor): string => {
  const next = charAt(cursor.value, cursor.index + 1);
  if (next !== "" && reAsciiPunctuation.test(next)) {
    cursor.index += 1;
    return `\\${next}`;
  }
  const followed = cursor.followingText !== "" || cursor.nonTextFollows;
  return next === "" && followed ? "\\\\" : "\\";
};

/**
 * The literal escapes that survive away from a line start: each returns the
 * spelling of the character at the cursor's index.
 */
const LITERAL_ESCAPE: Readonly<Record<string, (cursor: EscapeCursor) => string>> = {
  "\\": literalBackslash,
  // Escaped here as well as by the `escapeCellPipes` post-pass: if a raw
  // sibling ended on a lone backslash, a bare `|` would pair with it and eat
  // it, while `\|` leaves an even run the post-pass repairs.
  "|": (cursor) => (cursor.context.inTable ? "\\|" : "|"),
  "{": (cursor) => (cursor.mdx ? "\\{" : "{"),
  "<": (cursor) => (cursor.mdx ? "\\<" : "<"),
  "#": (cursor) =>
    cursor.context.inHeading &&
    isClosingHashRun(cursor.value, cursor.index, cursor.followingText, cursor.nonTextFollows)
      ? "\\#"
      : "#",
};

/**
 * The characters a literal escape may change away from a line start: the
 * line feed and the `LITERAL_ESCAPE` keys.
 */
const reLiteralSpecial = /[\n\\|{<#]/g;

/** The same characters as `reLiteralSpecial`, for a direct per-character lookup. */
const LITERAL_SPECIAL: Readonly<Record<string, true>> = {
  "\n": true,
  "\\": true,
  "|": true,
  "{": true,
  "<": true,
  "#": true,
};

/**
 * Escape the character at the cursor's index literally, or append the run of
 * characters up to the next one that may need an escape. The newline rules
 * are the canonical ones: they are all structural.
 */
const literalStep = (cursor: EscapeCursor): void => {
  const char = charAt(cursor.value, cursor.index);
  if (!cursor.lineStart && LITERAL_SPECIAL[char] !== true) {
    cursor.pushRun(cursor.nextSpecial(reLiteralSpecial));
  } else if (char === "\n") {
    cursor.newline(cursor.adjacentNewline() || cursor.lineStart);
  } else if (!cursor.lineStart || !literalLineStart(cursor, char)) {
    const escape = LITERAL_ESCAPE[char];
    cursor.push(escape === undefined ? char : escape(cursor), false);
  }
};

const literalText: {
  (
    value: string,
    context: InlineContext,
    atLineStart: boolean,
    mdx: boolean,
    followingText: string,
    nonTextFollows: boolean
  ): { text: string; atLineStart: boolean };
  (
    context: InlineContext,
    atLineStart: boolean,
    mdx: boolean,
    followingText: string,
    nonTextFollows: boolean
  ): (value: string) => { text: string; atLineStart: boolean };
} = dual(
  6,
  (
    value: string,
    context: InlineContext,
    atLineStart: boolean,
    mdx: boolean,
    followingText: string,
    nonTextFollows: boolean
  ): { text: string; atLineStart: boolean } => {
    const cursor = new EscapeCursor({ value, context, mdx, followingText, nonTextFollows }, atLineStart);
    for (; cursor.index < value.length; cursor.index += 1) {
      literalStep(cursor);
    }
    return { text: cursor.out, atLineStart: cursor.lineStart };
  }
);

// --- inline serialization ---------------------------------------------------

/**
 * Pick the effective emphasis marker, flipping away from a forbidden char.
 */
const emphasisMarker: {
  (fidelity: EmphasisChar | undefined, forbidden: string | undefined): EmphasisChar;
  (forbidden: string | undefined): (fidelity: EmphasisChar | undefined) => EmphasisChar;
} = dual(2, (fidelity: EmphasisChar | undefined, forbidden: string | undefined): EmphasisChar => {
  const chosen = fidelity ?? "*";
  return chosen === forbidden ? (chosen === "*" ? "_" : "*") : chosen;
});

/**
 * Emit a reference label for its bracket. Labels (and identifiers) in this
 * tree are SOURCE-FORM — the parser keeps character escapes unparsed, per
 * the mdast identifier contract — so the label already carries any escapes
 * its content needs and re-emitting it verbatim reproduces the original
 * bracket exactly. The only intervention is protecting a synthesized label's
 * UNESCAPED square brackets, which would otherwise break the bracket
 * structure. Definitions and references run through this same function, so
 * identifiers agree on both ends and resolution holds.
 */
const escapeLabel = Str.replace(/(?<!\\)([[\]])/g, "\\$1");

/**
 * Whether a destination character forces the pointy-bracket form: controls
 * and space (a bare destination allows neither — compared as strings, so an
 * astral character's leading surrogate never qualifies), plus the
 * bracket/backslash set whose bare spelling is ambiguous.
 */
const reAmbiguousDestinationChar = /[<>[\]\\]/;
const forcesPointy = (char: string): boolean => char <= " " || reAmbiguousDestinationChar.test(char);

/** Encode what a quoted or bracketed span cannot hold raw: `&` and line terminators. */
const encodeAmpersands = Str.replace(/&/g, "&amp;");
const encodeCarriageReturns = Str.replace(/\r/g, "&#13;");
const encodeLineFeeds = Str.replace(/\n/g, "&#10;");
const escapePointyDestination = Str.replace(/[<>\\]/g, "\\$&");
const escapeTitle = Str.replace(/[\\"]/g, "\\$&");

const encodeReferences = (value: string): string => encodeLineFeeds(encodeCarriageReturns(encodeAmpersands(value)));

/**
 * Wrap a link/image destination, pointy-bracketed when it needs it.
 */
const destination = (url: string): string =>
  url === "" || A.some([...url], forcesPointy) || !balancedParens(url)
    ? `<${escapePointyDestination(encodeReferences(url))}>`
    : encodeAmpersands(url);

/** How each parenthesis moves the nesting count. */
const PAREN_DELTA: Readonly<Record<string, number>> = { "(": 1, ")": -1 };

/**
 * Whether the destination's parentheses balance without dipping below zero
 * or nesting past the engine's 32-level cap.
 */
const balancedParens = (url: string): boolean => {
  let open = 0;
  for (const char of url) {
    open += PAREN_DELTA[char] ?? 0;
    if (open < 0 || open > 32) return false;
  }
  return open === 0;
};

const titleSuffix = (title: string | undefined): string =>
  title === undefined ? "" : ` "${escapeTitle(encodeReferences(title))}"`;

/**
 * The longest match of a run pattern (a global regex) anywhere in `value`.
 */
const longestMatch: {
  (value: string, run: RegExp): number;
  (run: RegExp): (value: string) => number;
} = dual(2, (value: string, run: RegExp): number => {
  let longest = 0;
  run.lastIndex = 0;
  for (let match = run.exec(value); match !== null; match = run.exec(value)) {
    longest = Math.max(longest, match[0].length);
  }
  return longest;
});

/**
 * Serialize an inline-code span with a fence run longer than any interior run.
 */
/** A run of backticks, and a run of tildes: the fence characters. */
const reBacktickRun = /`+/g;
const reTildeRun = /~+/g;

const inlineCode = (value: string): string => {
  const fence = Str.repeat(longestMatch(value, reBacktickRun) + 1)("`");
  // Padding restores what the spec's one-space stripping will remove: a
  // value touching a backtick at either end, or one that starts AND could
  // lose its real leading/trailing space. An all-space value is never
  // stripped, so it must NOT be padded.
  const allSpace = value !== "" && Str.trim(value) === "";
  const padded = !allSpace && reCodeSpanEdge.test(value) ? ` ${value} ` : value;
  return `${fence}${padded}${fence}`;
};

/** A code span value starting or ending with a backtick or a space. */
const reCodeSpanEdge = /^[` ]|[` ]$/;

/**
 * The emphasis-family parent whose markers sit at this run's edges. An
 * edge child's marker choice follows the nesting algebra, fidelity second:
 *
 * **Details**
 *
 * - `em{strong}`: uniform marker — `***x***` re-parses as `em{strong}`.
 * - `em{em}`: flip — `**x**` would read as strong.
 * - `strong{em}`: flip — `***x***` would swap the nesting order.
 * - `strong{strong}`: uniform — a fused 4+ run splits back into strongs.
 *
 * Mid-run children only avoid an actually adjacent marker char. On top of
 * either rule, an `_` that would sit against an alphanumeric cannot flank
 * and is corrected to `*` (the intraword-underscore restriction).
 */
interface JunctionGuard {
  readonly marker: EmphasisChar;
  readonly parent: "emphasis" | "strong";
}

const flipMarker = (marker: EmphasisChar): EmphasisChar => (marker === "*" ? "_" : "*");

/**
 * The edge-marker choice for a nested emphasis-family child.
 */
const nestedMarker: {
  (child: "emphasis" | "strong", fidelity: EmphasisChar | undefined, guard: JunctionGuard): EmphasisChar;
  (fidelity: EmphasisChar | undefined, guard: JunctionGuard): (child: "emphasis" | "strong") => EmphasisChar;
} = dual(3, (child: "emphasis" | "strong", fidelity: EmphasisChar | undefined, guard: JunctionGuard): EmphasisChar => {
  if (guard.parent === "emphasis") {
    return child === "strong" ? guard.marker : flipMarker(guard.marker);
  }
  return child === "emphasis" ? flipMarker(guard.marker) : (fidelity ?? guard.marker);
});

/**
 * Serialize a run of phrasing children. `junctionGuard` carries the marker
 * the PARENT emits at this run's edges, so a first or last emphasis-family
 * child flips away from it; mid-run children only flip away from an actual
 * adjacent marker char.
 */
interface InlineRun {
  atEdge: boolean;
  atLineStart: boolean;
  readonly children: ReadonlyArray<PhrasingContent>;
  readonly context: InlineContext;
  index: number;
  readonly junctionGuard: JunctionGuard | undefined;
  // The output is `out` + `pending`: the last emitted chunk stays pending so
  // its end can be read or rewritten without touching `out`, whose rope a
  // read would flatten (per child, that made a long paragraph quadratic).
  out: string;
  pending: string;
  previous: string;
  readonly state: StringifyState;
  textRun: string;
  textRunEnd: number;
  textRunOffset: number;
}

/** Append a (non-empty) chunk to the run's output, committing the previously pending one. */
const emit = (run: InlineRun, text: string): void => {
  if (text !== "") {
    run.out += run.pending;
    run.previous = run.pending;
    run.pending = text;
  }
};

/**
 * Internal seam for measuring the text inspected at inline output boundaries.
 *
 * **Example** (Read a chunk tail)
 * ```ts import.meta.vitest name="Read a chunk tail"
 * import { inlineOutput } from "@beep/markdown/internal/stringify";
 * inlineOutput.tail("abc") // => "bc"
 * ```
 * @category testing
 * @since 0.0.0
 */
export const inlineOutput = { tail: Str.slice(-2) };

/** The last two characters of a string (fewer when shorter). */
const lastTwo = Str.slice(-2);

/** The run output's last two characters, read off the last two chunks alone. */
const runTail = (run: InlineRun): string =>
  inlineOutput.tail(run.pending.length >= 2 ? run.pending : run.previous + run.pending);

const bangGuard = (run: InlineRun): void => {
  const tail = runTail(run);
  if (Str.endsWith("!")(tail) && !Str.endsWith("\\!")(tail)) {
    // The pending chunk ends with the `!`, so the rewrite stays local.
    run.pending = `${Str.slice(0, -1)(run.pending)}\\!`;
  }
};

/**
 * Open the contiguous text run starting at `run.index`: every adjacent text
 * sibling's value, joined, so each value's escaping sees what follows it.
 */
const openTextRun = (run: InlineRun): void => {
  const values: Array<string> = [];
  run.textRunEnd = run.index;
  for (let next = run.children[run.textRunEnd]; next?.type === "text"; next = run.children[run.textRunEnd]) {
    values.push(next.value);
    run.textRunEnd += 1;
  }
  run.textRun = A.join(values, "");
  run.textRunOffset = 0;
};

/** The next sibling after the current child, skipping empty text values. */
const nextNonEmptySibling = (run: InlineRun): PhrasingContent | undefined => {
  let nextIndex = run.index + 1;
  let next = run.children[nextIndex];
  while (next?.type === "text" && next.value === "") {
    nextIndex += 1;
    next = run.children[nextIndex];
  }
  return next;
};

const reLeadingAlphanumeric = /^[\p{L}\p{N}]/u;

/** Whether an `_` marker would sit against a letter or number on either side. */
const underscoreAgainstAlphanumeric = (run: InlineRun, lastChar: string | undefined): boolean => {
  const next = nextNonEmptySibling(run);
  return (
    (lastChar !== undefined && reAlphanumeric.test(lastChar)) ||
    (next?.type === "text" && reLeadingAlphanumeric.test(next.value))
  );
};

/**
 * The marker an emphasis-family child emits: the nesting algebra at a run
 * edge, otherwise its fidelity flipped away from an adjacent marker; an
 * underscore beside a letter or number cannot preserve emphasis.
 */
const emphasisChildMarker = (child: Emphasis | Strong, run: InlineRun): EmphasisChar => {
  const lastChar = lastCodePoint(runTail(run));
  const adjacentMarker = lastChar === "*" || lastChar === "_" ? lastChar : undefined;
  const marker =
    run.atEdge && run.junctionGuard !== undefined
      ? nestedMarker(child.type, child.markerChar, run.junctionGuard)
      : emphasisMarker(child.markerChar, adjacentMarker);
  return marker === "_" && underscoreAgainstAlphanumeric(run, lastChar) ? "*" : marker;
};

/** The bracket suffix of a reference: the label of a full reference, `[]` collapsed, nothing shortcut. */
const referenceSuffix = (referenceType: ReferenceType, label: string, full: string): string =>
  referenceType === "full" ? full : referenceType === "collapsed" ? `[${label}][]` : `[${label}]`;

const serializeInline = Match.type<PhrasingContent>().pipe(
  Match.discriminator("type")("text", (child) => (run: InlineRun) => {
    if (run.index >= run.textRunEnd) {
      openTextRun(run);
    }
    run.textRunOffset += child.value.length;
    const escaped = (child.escapeStyle === "literal" ? literalText : escapeText)(
      child.value,
      run.context,
      run.atLineStart,
      run.state.mdx,
      Str.slice(run.textRunOffset)(run.textRun),
      run.textRunEnd < run.children.length,
      // Only its last two characters are read, and only at a newline.
      run.previous + run.pending
    );
    emit(run, escaped.text);
    run.atLineStart = escaped.atLineStart;
  }),
  Match.discriminator("type")("inlineCode", (child) => (run: InlineRun) => {
    emit(run, inlineCode(child.value));
    run.atLineStart = false;
  }),
  Match.discriminator("type")("html", (child) => (run: InlineRun) => {
    emit(run, child.value);
    run.atLineStart = false;
  }),
  Match.discriminator("type")("break", (child) => (run: InlineRun) => {
    if (run.context.singleLine) {
      emit(run, " ");
      run.atLineStart = false;
    } else {
      emit(run, child.breakStyle === "spaces" ? "  \n" : "\\\n");
      run.atLineStart = true;
    }
  }),
  Match.discriminator("type")("emphasis", "strong", (child) => (run: InlineRun) => {
    const kind = child.type;
    const marker = emphasisChildMarker(child, run);
    const markers = kind === "strong" ? Str.repeat(2)(marker) : marker;
    const inner = serializeInlines(child.children, run.context, run.state, false, { parent: kind, marker });
    emit(run, `${markers}${inner}${markers}`);
    run.atLineStart = false;
  }),
  Match.discriminator("type")("delete", (child) => (run: InlineRun) => {
    emit(run, `~~${serializeInlines(child.children, run.context, run.state, false)}~~`);
    run.atLineStart = false;
  }),
  Match.discriminator("type")("link", (child) => (run: InlineRun) => {
    bangGuard(run);
    emit(
      run,
      `[${serializeInlines(child.children, run.context, run.state, false)}](${destination(child.url)}${titleSuffix(child.title)})`
    );
    run.atLineStart = false;
  }),
  Match.discriminator("type")("image", (child) => (run: InlineRun) => {
    const alt = escapeText(child.alt ?? "", run.context, false, run.state.mdx, "", false).text;
    emit(run, `![${alt}](${destination(child.url)}${titleSuffix(child.title)})`);
    run.atLineStart = false;
  }),
  Match.discriminator("type")("linkReference", (child) => (run: InlineRun) => {
    // The bracket of a shortcut or collapsed reference IS its
    // label; only a full reference carries free content. Labels go
    // through escapeLabel so definitions agree — see escapeLabel.
    bangGuard(run);
    const label = escapeLabel(child.label ?? child.identifier);
    const full = (): string => `[${serializeInlines(child.children, run.context, run.state, false)}][${label}]`;
    emit(run, referenceSuffix(child.referenceType, label, child.referenceType === "full" ? full() : ""));
    run.atLineStart = false;
  }),
  Match.discriminator("type")("imageReference", (child) => (run: InlineRun) => {
    const label = escapeLabel(child.label ?? child.identifier);
    const alt = (): string => escapeText(child.alt ?? "", run.context, false, run.state.mdx, "", false).text;
    emit(
      run,
      `!${referenceSuffix(child.referenceType, label, child.referenceType === "full" ? `[${alt()}][${label}]` : "")}`
    );
    run.atLineStart = false;
  }),
  Match.discriminator("type")("footnoteReference", (child) => (run: InlineRun) => {
    emit(run, `[^${escapeLabel(child.label ?? child.identifier)}]`);
    run.atLineStart = false;
  }),
  Match.discriminator("type")("mdxJsxTextElement", (child) => (run: InlineRun) => {
    emit(run, serializeMdxJsxText(child, run.context, run.state));
    run.atLineStart = false;
  }),
  Match.discriminator("type")("mdxTextExpression", (child) => (run: InlineRun) => {
    emit(run, mdxExpression(child.value));
    run.atLineStart = false;
  }),
  Match.exhaustive
);

/** A surrogate pair: one astral code point. */
const reSurrogatePair = /^[\uD800-\uDBFF][\uDC00-\uDFFF]$/;

/** The last code point emitted so far, or `undefined` before any output. */
const lastCodePoint = (out: string): string | undefined => {
  const pair = Str.slice(-2)(out);
  return out === "" ? undefined : reSurrogatePair.test(pair) ? pair : Str.slice(-1)(out);
};

const serializeInlines: {
  (
    children: ReadonlyArray<PhrasingContent>,
    context: InlineContext,
    state: StringifyState,
    startsLine: boolean,
    junctionGuard?: JunctionGuard
  ): string;
  (
    context: InlineContext,
    state: StringifyState,
    startsLine: boolean,
    junctionGuard?: JunctionGuard
  ): (children: ReadonlyArray<PhrasingContent>) => string;
} = dual(
  (args) => A.isArray(args[0]),
  (
    children: ReadonlyArray<PhrasingContent>,
    context: InlineContext,
    state: StringifyState,
    startsLine: boolean,
    junctionGuard?: JunctionGuard
  ): string => {
    const run: InlineRun = {
      out: "",
      pending: "",
      previous: "",
      atLineStart: startsLine,
      index: 0,
      textRunEnd: 0,
      textRun: "",
      textRunOffset: 0,
      children,
      context,
      state,
      junctionGuard,
      atEdge: true,
    };
    for (const child of children) {
      guard(state, child);
      run.atEdge = run.pending === "" || run.index === children.length - 1;
      serializeInline(child)(run);
      run.index += 1;
      unguard(state);
    }
    return run.out + run.pending;
  }
);
// --- MDX serialization ------------------------------------------------------
//
// Oracle parity: mdast-util-mdx-jsx@3.2.0's `mdxJsxToMarkdown` with its
// defaults (quote `"`, no quoteSmart, spaced self-closing `<a />`, no
// printWidth — attributes wrap onto their own lines only when one carries a
// line ending), mdast-util-mdx-expression@2.0.1's `{expr}` handler with
// two-space continuation indentation, and mdast-util-mdxjs-esm@2.0.1's
// verbatim value. Child BLOCK content inside a flow element follows this
// package's canonical table (bullet `-`, ATX headings, ...), not the oracle's
// to-markdown defaults — the MDX structure is oracle-shaped, the markdown
// inside it is canonical.

/**
 * The tag string of every MDX node type.
 */
const $I = $MarkdownId.create("internal/stringify");
const MdxNodeType = LiteralKit([
  "mdxJsxFlowElement",
  "mdxJsxTextElement",
  "mdxFlowExpression",
  "mdxTextExpression",
  "mdxjsEsm",
]).pipe($I.annoteSchema("MdxNodeType", { description: "Node kinds that enable MDX text escaping." }));
const isMdxNodeType = S.is(MdxNodeType);

/**
 * The minimal structural shape the MDX presence scan needs.
 */
interface WalkableNode {
  readonly children?: ReadonlyArray<WalkableNode>;
  readonly type: string;
}

/**
 * Whether the tree carries any MDX node — iterative, deliberately unguarded.
 */
const treeContainsMdx = (root: WalkableNode): boolean => {
  const stack: WalkableNode[] = [root];
  for (let node = stack.pop(); node !== undefined; node = stack.pop()) {
    if (isMdxNodeType(node.type)) {
      return true;
    }
    if (node.children !== undefined) {
      for (const child of node.children) {
        stack.push(child);
      }
    }
  }
  return false;
};

/**
 * The oracle's `indentLines` line model (mdast-util-to-markdown
 * `lib/util/indent-lines.js`): lines split on every terminator spelling
 * (`\r\n`, `\n`, bare `\r`), terminators preserved verbatim between the
 * mapped lines, and `blank` meaning an empty line — so a blank CRLF line
 * stays bare instead of having a retained `\r` treated as content.
 */
const mapMdxLines: {
  (value: string, map: (line: string, index: number, blank: boolean) => string): string;
  (map: (line: string, index: number, blank: boolean) => string): (value: string) => string;
} = dual(2, (value: string, map: (line: string, index: number, blank: boolean) => string): string => {
  const eol = /\r?\n|\r/g;
  const result: string[] = [];
  let start = 0;
  let index = 0;
  for (let match = eol.exec(value); match !== null; match = eol.exec(value)) {
    const line = Str.slice(start, match.index)(value);
    result.push(map(line, index, line === ""), match[0]);
    start = match.index + match[0].length;
    index += 1;
  }
  const last = Str.slice(start)(value);
  result.push(map(last, index, last === ""));
  return A.join(result, "");
});

/**
 * Serialize an MDX expression body between braces. Continuation lines take
 * the oracle's two-space indent; the first line and blank lines take none.
 */
const mdxExpression = (value: string): string =>
  `{${mapMdxLines(value, (line, index, blank) => (index === 0 || blank ? line : `  ${line}`))}}`;

/**
 * Serialize one JSX attribute. A `null` or absent value is a boolean
 * attribute; a string value is quoted with `"` (the oracle default), the
 * quote itself escaped as `&#x22;` exactly as `stringify-entities` spells
 * it; an expression value goes between braces.
 */
const serializeMdxAttribute = (attribute: MdxJsxAttributeContent): string => {
  if (attribute.type === "mdxJsxExpressionAttribute") {
    return `{${attribute.value}}`;
  }
  const value = attribute.value;
  if (value === undefined || value === null) {
    return attribute.name;
  }
  if (P.isString(value)) {
    return `${attribute.name}="${Str.replaceAll('"', "&#x22;")(value)}"`;
  }
  return `${attribute.name}={${value.value}}`;
};

/**
 * Serialize a text (phrasing) JSX element.
 */
const serializeMdxJsxText: {
  (node: MdxJsxTextElement, context: InlineContext, state: StringifyState): string;
  (context: InlineContext, state: StringifyState): (node: MdxJsxTextElement) => string;
} = dual(3, (node: MdxJsxTextElement, context: InlineContext, state: StringifyState): string => {
  const attributes = A.map(node.attributes, serializeMdxAttribute);
  const selfClosing = node.name !== null && node.children.length === 0;
  let out = `<${node.name ?? ""}`;
  if (attributes.length > 0) {
    out += ` ${A.join(attributes, " ")}`;
  }
  if (selfClosing) {
    return `${out} />`;
  }
  out += ">";
  out += serializeInlines(node.children, context, state, false);
  out += `</${node.name ?? ""}>`;
  return out;
});

/**
 * Prefix every line of a rendered child block; blank lines stay bare.
 */
const indentBlockLines: {
  (content: string, indent: string): string;
  (indent: string): (content: string) => string;
} = dual(2, (content: string, indent: string): string =>
  mapMdxLines(content, (line, _index, blank) => (blank ? line : `${indent}${line}`))
);

/**
 * Serialize a flow (block) JSX element: opening tag (attributes on their own
 * lines when one carries a line ending), children as indented block layout,
 * closing tag — the oracle's `mdxElement` flow branch.
 */
/**
 * The opening tag of a flow element: attributes on their own lines when one
 * carries a line ending, the spaced self-closing slash when it has no
 * children.
 */
const mdxJsxFlowOpeningTag: {
  (node: MdxJsxFlowElement, indent: string): string;
  (indent: string): (node: MdxJsxFlowElement) => string;
} = dual(2, (node: MdxJsxFlowElement, indent: string): string => {
  const attributes = A.map(node.attributes, serializeMdxAttribute);
  const selfClosing = node.name !== null && node.children.length === 0;
  const attributesOnOneLine = A.join(attributes, " ");
  const attributesOnTheirOwnLine = reLineTerminator.test(attributesOnOneLine);
  // Only the first line of each attribute is indented — attribute VALUES
  // cannot be re-indented without changing them.
  const attributeText = attributesOnTheirOwnLine
    ? `\n${A.join(
        A.map(attributes, (attribute) => `${indent}  ${attribute}`),
        "\n"
      )}\n${indent}`
    : attributesOnOneLine === ""
      ? ""
      : ` ${attributesOnOneLine}`;
  const slash = selfClosing ? `${attributesOnTheirOwnLine ? "" : " "}/` : "";
  return `${indent}<${node.name ?? ""}${attributeText}${slash}>`;
});

const reLineTerminator = /[\r\n]/;

/**
 * A flow element's children in block layout, one JSX level deeper. A nested
 * flow element indents itself (it reads the deeper jsxDepth); every other
 * block is rendered flush and indented here, blank lines excepted — the
 * oracle's containerFlow.
 */
const mdxJsxFlowChildren: {
  (node: MdxJsxFlowElement, state: StringifyState): string;
  (state: StringifyState): (node: MdxJsxFlowElement) => string;
} = dual(2, (node: MdxJsxFlowElement, state: StringifyState): string => {
  state.jsxDepth += 1;
  const childIndent = Str.repeat(state.jsxDepth)("  ");
  const parts = A.map(node.children, (child) => {
    if (child.type === "mdxJsxFlowElement") {
      guard(state, child);
      const rendered = serializeMdxJsxFlow(child, state);
      unguard(state);
      return rendered;
    }
    return indentBlockLines(serializeBlocks([child], state), childIndent);
  });
  state.jsxDepth -= 1;
  return `\n${A.join(parts, "\n\n")}\n`;
});

/**
 * Serialize a flow (block) JSX element: opening tag (attributes on their own
 * lines when one carries a line ending), children as indented block layout,
 * closing tag — the oracle's `mdxElement` flow branch.
 */
const serializeMdxJsxFlow: {
  (node: MdxJsxFlowElement, state: StringifyState): string;
  (state: StringifyState): (node: MdxJsxFlowElement) => string;
} = dual(2, (node: MdxJsxFlowElement, state: StringifyState): string => {
  const indent = Str.repeat(state.jsxDepth)("  ");
  const children = node.children.length > 0 ? mdxJsxFlowChildren(node, state) : "";
  const closing = node.name !== null && node.children.length === 0 ? "" : `${indent}</${node.name ?? ""}>`;
  return `${mdxJsxFlowOpeningTag(node, indent)}${children}${closing}`;
});

// --- block serialization ----------------------------------------------------

/**
 * Prefix every line of `content`; blank lines take the trimmed prefix.
 */
const prefixLines: {
  (content: string, prefix: string, blankPrefix: string): string;
  (prefix: string, blankPrefix: string): (content: string) => string;
} = dual(3, (content: string, prefix: string, blankPrefix: string): string =>
  pipe(
    Str.split(content, "\n"),
    A.map((line) => (line === "" ? blankPrefix : `${prefix}${line}`)),
    A.join("\n")
  )
);

/**
 * First line gets `marker`, continuation lines get spaces of its width.
 */
const hangingIndent: {
  (content: string, marker: string): string;
  (marker: string): (content: string) => string;
} = dual(2, (content: string, marker: string): string => {
  const lines = Str.split(content, "\n");
  const indent = Str.repeat(marker.length)(" ");
  return pipe(
    lines,
    A.map((line, index) => {
      if (index === 0) return `${marker}${line}`;
      return line === "" ? "" : `${indent}${line}`;
    }),
    A.join("\n")
  );
});

/** A character's decimal numeric character reference. */
const numericReference = (char: string): string => `&#${O.getOrThrow(Str.charCodeAt(char, 0))};`;

/** Encode decoded info without introducing fence syntax or token boundaries. */
const encodeCodeInfo: {
  (value: string, language: boolean, fenceChar: Code["fenceChar"]): string;
  (language: boolean, fenceChar: Code["fenceChar"]): (value: string) => string;
} = dual(3, (value: string, language: boolean, fenceChar: Code["fenceChar"]): string => {
  const encoded = pipe(
    value,
    Str.replace(/&/g, "&amp;"),
    Str.replace(/\\/g, "&#92;"),
    Str.replace(/`/g, "&#96;"),
    replaceAllWith(language ? /\s/g : /[\t\r\n\v\f]|^\s|\s$/g, numericReference)
  );
  return language && fenceChar === "~" ? Str.replace(/^~/, "&#126;")(encoded) : encoded;
});

/** Indent every non-blank line by four spaces; blank lines stay bare. */
const indentCodeBlock = (lines: ReadonlyArray<string>): string =>
  A.join(
    A.map(lines, (line) => (line === "" ? "" : `    ${line}`)),
    "\n"
  );

/**
 * Whether a code block can take the indented spelling: no fence asked for (by
 * the caller or a fidelity field), no info string, and non-empty content with
 * no blank first or last line.
 */
const indentable: {
  (node: Code, lines: ReadonlyArray<string>, forceFence: boolean): boolean;
  (lines: ReadonlyArray<string>, forceFence: boolean): (node: Code) => boolean;
} = dual(
  3,
  (node: Code, lines: ReadonlyArray<string>, forceFence: boolean): boolean =>
    !forceFence &&
    node.fenceChar === undefined &&
    node.lang === undefined &&
    node.meta === undefined &&
    A.match(lines, {
      onEmpty: () => false,
      onNonEmpty: (nonEmpty) => A.headNonEmpty(nonEmpty) !== "" && A.lastNonEmpty(nonEmpty) !== "",
    })
);

/** The info string after an opening fence: the encoded language, then the encoded meta. */
const fenceInfo: {
  (node: Code, char: FenceChar): string;
  (char: FenceChar): (node: Code) => string;
} = dual(2, (node: Code, char: FenceChar): string => {
  if (node.lang === undefined) return "";
  const meta = node.meta === undefined ? "" : ` ${encodeCodeInfo(node.meta, false, char)}`;
  return `${encodeCodeInfo(node.lang, true, char)}${meta}`;
});

const serializeCode: {
  (node: Code, forceFence: boolean): string;
  (forceFence: boolean): (node: Code) => string;
} = dual(2, (node: Code, forceFence: boolean): string => {
  // The parser's code values end with the block's final line terminator;
  // it belongs to block structure, not content, on the way back out.
  const value = Str.endsWith("\n")(node.value) ? Str.slice(0, -1)(node.value) : node.value;
  const lines = value === "" ? [] : Str.split(value, "\n");
  if (indentable(node, lines, forceFence)) {
    return indentCodeBlock(lines);
  }
  const char = node.fenceChar ?? "`";
  const longest = longestMatch(value, char === "`" ? reBacktickRun : reTildeRun);
  const fence = Str.repeat(Math.max(3, node.fenceLength ?? 0, longest + 1))(char);
  const body = value === "" ? "" : `${value}\n`;
  return `${fence}${fenceInfo(node, char)}\n${body}${fence}`;
});

const setextUnderline: {
  (heading: Heading, content: string): string;
  (content: string): (heading: Heading) => string;
} = dual(2, (heading: Heading, content: string): string => {
  const lastLine = A.lastNonEmpty(Str.split(content, "\n"));
  const char = heading.depth === 1 ? "=" : "-";
  return Str.repeat(Math.max(1, lastLine.length))(char);
});

const serializeHeading: {
  (heading: Heading, state: StringifyState): string;
  (state: StringifyState): (heading: Heading) => string;
} = dual(2, (heading: Heading, state: StringifyState): string => {
  // Setext content IS a line start (nothing precedes it on its line), so
  // the line-start escapes apply; ATX content follows the `# ` prefix.
  const setext = heading.headingStyle === "setext" && heading.depth <= 2;
  const content = serializeInlines(heading.children, HEADING_CONTEXT, state, setext);
  if (setext && content !== "") {
    return `${content}\n${setextUnderline(heading, content)}`;
  }
  const hashes = Str.repeat(heading.depth)("#");
  return content === "" ? hashes : `${hashes} ${content}`;
});

const serializeDefinition = (node: Definition): string =>
  `[${escapeLabel(node.label ?? node.identifier)}]: ${destination(node.url)}${titleSuffix(node.title)}`;

const serializeFootnoteDefinition: {
  (node: FootnoteDefinition, state: StringifyState): string;
  (state: StringifyState): (node: FootnoteDefinition) => string;
} = dual(2, (node: FootnoteDefinition, state: StringifyState): string => {
  // The definition's four-space continuation indent stacks UNDER the JSX
  // indent: the oracle's inferDepth breaks only at blockquote and listItem,
  // so a flow element nested through a footnote definition keeps counting
  // its JSX ancestors and self-indents one step deeper. No jsxDepth reset.
  const content = serializeBlocks(node.children, state);
  const lines = Str.split(content, "\n");
  const marker = `[^${escapeLabel(node.label ?? node.identifier)}]:`;
  // Indented code cannot share the marker line — its leading spaces would
  // be stripped as marker padding and the line would re-parse as a
  // paragraph. The bare-marker form starts the content on its own line.
  const bareMarker = node.children[0]?.type === "code";
  if (bareMarker) {
    return A.join([marker, ...A.map(lines, (line) => (line === "" ? "" : `    ${line}`))], "\n");
  }
  return pipe(
    lines,
    A.map((line, index) => {
      if (index === 0) return `${marker} ${line}`;
      return line === "" ? "" : `    ${line}`;
    }),
    A.join("\n")
  );
});

/** The delimiter-row cell for each column alignment (an unknown alignment is `---`). */
const ALIGN_CELL: Readonly<Record<TableAlign, string>> = { left: ":--", right: "--:", center: ":-:" };

const alignCell = (align: TableAlign | null | undefined): string =>
  align === null || align === undefined ? "---" : ALIGN_CELL[align];

/**
 * Escape every cell pipe the GFM cell splitter would read as a column
 * boundary. The splitter consumes a backslash and the punctuation after it as
 * one character, so `\\` is an escaped backslash: a pipe is escaped already
 * iff the run of backslashes directly before it has odd length, and needs a
 * `\` iff that run is even, zero included.
 */
const escapeCellPipes = Str.replaceAll(/(?<!\\)((?:\\\\)*)\|/g, "$1\\|");

const serializeTable: {
  (table: Table, state: StringifyState): string;
  (state: StringifyState): (table: Table) => string;
} = dual(2, (table: Table, state: StringifyState): string => {
  const columnCount = A.reduce(table.children, 1, (count, row) => Math.max(count, row.children.length));
  const rows = A.map(table.children, (row) => {
    guard(state, row);
    const cells = A.map(row.children, (cell) => {
      guard(state, cell);
      // Text-level pipes are escaped by the cell context; anything a
      // nested emission smuggled through raw (a code span, raw HTML, a
      // destination) gets caught here — the cell splitter unescapes `\|`
      // everywhere in a cell, code spans included, so this is lossless.
      const content = escapeCellPipes(serializeInlines(cell.children, CELL_CONTEXT, state, false));
      unguard(state);
      return content;
    });
    unguard(state);
    while (cells.length < columnCount) cells.push("");
    return `| ${A.join(cells, " | ")} |`;
  });
  const alignRow = `| ${A.join(
    A.makeBy(columnCount, (column) => alignCell(table.align?.[column])),
    " | "
  )} |`;
  const [header, ...body] = rows;
  return A.join(
    [
      header ??
        `| ${A.join(
          A.makeBy(columnCount, () => ""),
          " | "
        )} |`,
      alignRow,
      ...body,
    ],
    "\n"
  );
});

/**
 * The marker actually used by a list, for adjacency comparison.
 */
/** Each list kind's canonical marker, then the one it flips to. */
const ORDERED_DELIMITERS = [".", ")"] as const;
const BULLET_MARKERS = ["-", "*"] as const;

const effectiveListMarker: {
  (list: List, flipped: boolean): string;
  (flipped: boolean): (list: List) => string;
} = dual(2, (list: List, flipped: boolean): string => {
  const [canonical, alternate] = list.ordered === true ? ORDERED_DELIMITERS : BULLET_MARKERS;
  const marker = (list.ordered === true ? list.delimiter : list.bulletChar) ?? canonical;
  if (!flipped) return marker;
  return marker === canonical ? alternate : canonical;
});

const serializeListItem: {
  (item: ListItem, marker: string, state: StringifyState, tight: boolean): string;
  (marker: string, state: StringifyState, tight: boolean): (item: ListItem) => string;
} = dual(4, (item: ListItem, marker: string, state: StringifyState, tight: boolean): string => {
  guard(state, item);
  // In a tight list a blank line anywhere inside an item would loosen the
  // whole list on re-parse, so same-item block pairs join with a bare
  // newline wherever the interruption rules allow it; pairs that genuinely
  // need the blank line are the documented tight-multi-block edge.
  // The item's hanging indent owns indentation from here in, so the JSX
  // indent counter restarts (the oracle's inferDepth break).
  const savedJsxDepth = state.jsxDepth;
  state.jsxDepth = 0;
  const inner = serializeBlocks(item.children, state, tight);
  state.jsxDepth = savedJsxDepth;
  unguard(state);
  const checkbox = item.checked === undefined ? "" : item.checked ? "[x] " : "[ ] ";
  const content = `${checkbox}${inner}`;
  if (content === "") return Str.trimEnd(marker);
  return hangingIndent(content, marker);
});

const serializeList: {
  (list: List, state: StringifyState, flipped: boolean): string;
  (state: StringifyState, flipped: boolean): (list: List) => string;
} = dual(3, (list: List, state: StringifyState, flipped: boolean): string => {
  const tight = !(list.spread ?? false);
  const items = A.map(list.children, (item, index) => {
    const marker =
      list.ordered === true
        ? `${(list.start ?? 1) + index}${effectiveListMarker(list, flipped)} `
        : `${effectiveListMarker(list, flipped)} `;
    return serializeListItem(item, marker, state, tight);
  });
  return A.join(items, tight ? "\n" : "\n\n");
});

type Block = FlowContent | Frontmatter | MdxjsEsm | Paragraph;

/**
 * Whether `next` interrupts a paragraph without a blank line before it.
 */
const interruptsParagraph = Match.type<Block>().pipe(
  Match.discriminator("type")("list", (next) => next.ordered !== true || (next.start ?? 1) === 1),
  Match.discriminator("type")("blockquote", "thematicBreak", () => true),
  Match.discriminator("type")("heading", (next) => next.headingStyle !== "setext"),
  Match.discriminator("type")(
    "code",
    (next) => next.fenceChar !== undefined || next.lang !== undefined || next.meta !== undefined
  ),
  Match.orElse(() => false)
);

/**
 * Whether `prev` and `next` may sit on adjacent lines with no blank line
 * between them without either absorbing the other on re-parse. Drives tight
 * list items; anything not provably safe takes the blank line.
 */
const canJoinWithoutBlankDispatch = Match.type<{ prev: Block; next: Block }>().pipe(
  Match.when({ prev: { type: "heading" } }, () => true),
  Match.when({ prev: { type: "thematicBreak" } }, () => true),
  Match.when({ prev: { type: "code" } }, ({ prev, next }) => {
    // A closed fence self-terminates. Indented code ends at the first
    // insufficiently indented line — but another indented block would
    // merge into it.
    if (prev.fenceChar !== undefined || prev.lang !== undefined || prev.meta !== undefined) return true;
    return !(
      next.type === "code" &&
      next.fenceChar === undefined &&
      next.lang === undefined &&
      next.meta === undefined
    );
  }),
  Match.when({ prev: { type: "paragraph" } }, ({ next }) => interruptsParagraph(next)),
  Match.when(
    { prev: { type: "blockquote" } },
    ({ next }) => next.type !== "blockquote" && next.type !== "paragraph" && interruptsParagraph(next)
  ),
  Match.orElse(() => false)
);

const canJoinWithoutBlank: {
  (prev: Block, next: Block): boolean;
  (next: Block): (prev: Block) => boolean;
} = dual(2, (prev: Block, next: Block): boolean => canJoinWithoutBlankDispatch({ prev, next }));

/**
 * Serialize a sequence of flow blocks, handling sibling adjacency. With
 * `tight`, safe pairs join with a bare newline (tight-list items).
 */
interface BlockRun {
  readonly parts: string[];
  previous: Block | undefined;
  previousListMarker: string | undefined;
  readonly state: StringifyState;
}

const serializeBlock = Match.type<Block>().pipe(
  Match.discriminator("type")("paragraph", (child) => (run: BlockRun) => {
    run.parts.push(serializeInlines(child.children, FLOW_CONTEXT, run.state, true));
    run.previousListMarker = undefined;
  }),
  Match.discriminator("type")("heading", (child) => (run: BlockRun) => {
    run.parts.push(serializeHeading(child, run.state));
    run.previousListMarker = undefined;
  }),
  Match.discriminator("type")("thematicBreak", (child) => (run: BlockRun) => {
    run.parts.push(Str.repeat(3)(child.markerChar ?? "*"));
    run.previousListMarker = undefined;
  }),
  Match.discriminator("type")("code", (child) => (run: BlockRun) => {
    // An indented block right after a list would be absorbed into
    // its last item on re-parse; force a fence there.
    run.parts.push(serializeCode(child, run.previous?.type === "list"));
    run.previousListMarker = undefined;
  }),
  Match.discriminator("type")("html", (child) => (run: BlockRun) => {
    run.parts.push(child.value);
    run.previousListMarker = undefined;
  }),
  Match.discriminator("type")("blockquote", (child) => (run: BlockRun) => {
    // A blockquote's `> ` prefix owns indentation from here in, so
    // the JSX indent counter restarts (the oracle's inferDepth
    // break at blockquote/listItem).
    const savedJsxDepth = run.state.jsxDepth;
    run.state.jsxDepth = 0;
    const inner = serializeBlocks(child.children, run.state);
    run.state.jsxDepth = savedJsxDepth;
    run.parts.push(prefixLines(inner, "> ", ">"));
    run.previousListMarker = undefined;
  }),
  Match.discriminator("type")("list", (child) => (run: BlockRun) => {
    const flipped =
      run.previousListMarker !== undefined && run.previousListMarker === effectiveListMarker(child, false);
    run.parts.push(serializeList(child, run.state, flipped));
    run.previousListMarker = effectiveListMarker(child, flipped);
  }),
  Match.discriminator("type")("definition", (child) => (run: BlockRun) => {
    run.parts.push(serializeDefinition(child));
    run.previousListMarker = undefined;
  }),
  Match.discriminator("type")("footnoteDefinition", (child) => (run: BlockRun) => {
    run.parts.push(serializeFootnoteDefinition(child, run.state));
    run.previousListMarker = undefined;
  }),
  Match.discriminator("type")("table", (child) => (run: BlockRun) => {
    run.parts.push(serializeTable(child, run.state));
    run.previousListMarker = undefined;
  }),
  Match.discriminator("type")("frontmatter", (child) => (run: BlockRun) => {
    const open = child.format === "toml" ? "+++" : child.format === "json" ? "---json" : "---";
    const close = child.format === "toml" ? "+++" : "---";
    run.parts.push(child.value === "" ? `${open}\n${close}` : `${open}\n${child.value}\n${close}`);
    run.previousListMarker = undefined;
  }),
  Match.discriminator("type")("mdxJsxFlowElement", (child) => (run: BlockRun) => {
    run.parts.push(serializeMdxJsxFlow(child, run.state));
    run.previousListMarker = undefined;
  }),
  Match.discriminator("type")("mdxFlowExpression", (child) => (run: BlockRun) => {
    run.parts.push(mdxExpression(child.value));
    run.previousListMarker = undefined;
  }),
  Match.discriminator("type")("mdxjsEsm", (child) => (run: BlockRun) => {
    // Verbatim, the oracle's handler: the value IS the emitted
    // block, statement terminators included as written.
    run.parts.push(child.value);
    run.previousListMarker = undefined;
  }),
  Match.exhaustive
);

const serializeBlocks: {
  (children: ReadonlyArray<Block>, state: StringifyState, tight?: boolean): string;
  (state: StringifyState, tight?: boolean): (children: ReadonlyArray<Block>) => string;
} = dual(
  (args) => A.isArray(args[0]),
  (children: ReadonlyArray<Block>, state: StringifyState, tight?: boolean): string => {
    const parts: string[] = [];
    const nodes: Block[] = [];
    let previous: Block | undefined;
    const run: BlockRun = { parts, state, previous: undefined, previousListMarker: undefined };
    for (const child of children) {
      guard(state, child);
      serializeBlock(child)(run);
      run.previous = child;
      nodes.push(child);
      unguard(state);
    }
    if (tight !== true) return A.join(parts, "\n\n");
    let out = "";
    previous = undefined;
    for (const [node, part] of A.zip(nodes, parts)) {
      if (previous !== undefined) {
        out += canJoinWithoutBlank(previous, node) ? "\n" : "\n\n";
      }
      out += part;
      previous = node;
    }
    return out;
  }
);

/**
 * Serialize a document tree to canonical markdown source.
 *
 * **Details**
 *
 * Throws the raw `GuardExceeded` carrier when the tree nests past
 * `MAX_NESTING_DEPTH`; the facade materializes the typed error. Output is
 * empty for an empty root and ends with exactly one newline otherwise.
 *
 * **Example** (Serialize an empty document)
 *
 * ```ts
 * import { stringifyTree } from "@beep/markdown/internal/stringify";
 * import { Root } from "@beep/markdown/MarkdownNode";
 *
 * const root = Root.make({ children: [] });
 * console.log(JSON.stringify(stringifyTree(root))) // ""
 * ```
 *
 * @category serialization
 * @since 0.0.0
 */
export const stringifyTree = (root: Root): string => {
  const state: StringifyState = { depth: 0, jsxDepth: 0, mdx: treeContainsMdx(root) };
  const body = serializeBlocks(root.children, state);
  return body === "" ? "" : `${body}\n`;
};
