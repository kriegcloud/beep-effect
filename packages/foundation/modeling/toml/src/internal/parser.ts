// Recursive descent over the scanner producing the lossless linear CST.
// The load-bearing contract is the SPAN TILING INVARIANT: every expression's
// span starts at the first character of its line's leading whitespace (the
// BOM included, on the first line) and ends after its terminating newline (or
// at EOF); consecutive blank/comment-only lines coalesce into one TomlTrivia;
// concatenating every expression's source slice in order reproduces the
// source byte-exactly. Stringify rides on it.
//
// The one recursion surface is parseValue → parseArray/parseInlineTable,
// guarded by an explicit `depth` parameter against MAX_NESTING_DEPTH
// (GuardExceeded at the opening bracket). Everything else is a linear walk.

import * as O from "@beep/utils/Option";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import {
  TomlArray,
  TomlArrayTableHeader,
  TomlBoolean,
  TomlDateTimeLiteral,
  TomlFloat,
  TomlInlineEntry,
  TomlInlineTable,
  TomlInteger,
  TomlKey,
  TomlKeyValue,
  TomlString,
  TomlTableHeader,
  TomlTrivia,
} from "../TomlNode.ts";
import { raise } from "./diagnostics.ts";
import { GuardExceeded, MAX_NESTING_DEPTH } from "./limits.ts";
import {
  assertValidUnicode,
  classifyValueToken,
  scanBareKey,
  scanBasicString,
  scanComment,
  scanLiteralString,
  scanMultilineBasicString,
  scanMultilineLiteralString,
  scanNewline,
  scanValueToken,
  scanWhitespace,
  skipBom,
} from "./scanner.ts";
import type { TomlExpression, TomlValueNode } from "../TomlNode.ts";
import type { ScanResult } from "./scanner.ts";

const LF = 0x0a;
const CR = 0x0d;
const QUOTE = 0x22;
const HASH = 0x23;
const APOSTROPHE = 0x27;
const COMMA = 0x2c;
const DOT = 0x2e;
const EQUALS = 0x3d;
const LEFT_BRACKET = 0x5b;
const RIGHT_BRACKET = 0x5d;
const LEFT_BRACE = 0x7b;
const RIGHT_BRACE = 0x7d;

/** A parsed piece and the position after it. */
interface Parsed<T> {
  readonly end: number;
  readonly node: T;
}

/** Decoded trailing-comment text: the raw text after `#` with one leading space stripped. */
const decodeComment = (raw: string): string => (raw.startsWith(" ") ? raw.slice(1) : raw);

/** One simple key: bare, basic-quoted or literal-quoted. */
const parseSimpleKey: {
  (source: string, pos: number): Parsed<TomlKey>;
  (pos: number): (source: string) => Parsed<TomlKey>;
} = dual(2, (source: string, pos: number): Parsed<TomlKey> => {
  const code = source.charCodeAt(pos);
  if (code === QUOTE) {
    const scanned = scanBasicString(source, pos);
    return {
      node: TomlKey.make({ value: scanned.value, kind: "basic", offset: pos, length: scanned.end - pos }),
      end: scanned.end,
    };
  }
  if (code === APOSTROPHE) {
    const scanned = scanLiteralString(source, pos);
    return {
      node: TomlKey.make({ value: scanned.value, kind: "literal", offset: pos, length: scanned.end - pos }),
      end: scanned.end,
    };
  }
  const bare = scanBareKey(source, pos);
  if (bare.end === pos) {
    return raise("ExpectedKey", "expected a key", pos, 1);
  }
  return {
    node: TomlKey.make({ value: bare.value, kind: "bare", offset: pos, length: bare.end - pos }),
    end: bare.end,
  };
});

/** A dotted key path: `simple-key ( ws "." ws simple-key )*`. */
const parseKeyPath: {
  (source: string, pos: number): Parsed<ReadonlyArray<TomlKey>>;
  (pos: number): (source: string) => Parsed<ReadonlyArray<TomlKey>>;
} = dual(2, (source: string, pos: number): Parsed<ReadonlyArray<TomlKey>> => {
  const keys: Array<TomlKey> = [];
  const first = parseSimpleKey(source, pos);
  keys.push(first.node);
  let i = first.end;
  for (;;) {
    const afterWs = scanWhitespace(source, i);
    if (source.charCodeAt(afterWs) !== DOT) {
      break;
    }
    const keyStart = scanWhitespace(source, afterWs + 1);
    const next = parseSimpleKey(source, keyStart);
    keys.push(next.node);
    i = next.end;
  }
  return { node: keys, end: i };
});

/** The end of an expression line: ws + optional comment + newline (or EOF), else ExpectedNewline. */
const parseLineEnd: {
  (source: string, pos: number): { readonly comment?: string; readonly end: number };
  (pos: number): (source: string) => { readonly comment?: string; readonly end: number };
} = dual(2, (source: string, pos: number): { readonly comment?: string; readonly end: number } => {
  let i = scanWhitespace(source, pos);
  let comment: string | undefined;
  if (source.charCodeAt(i) === HASH) {
    const scanned = scanComment(source, i);
    comment = decodeComment(scanned.value);
    i = scanned.end;
  }
  if (i >= source.length) {
    return { ...O.getSomesStruct({ comment: O.fromUndefinedOr(comment) }), end: i };
  }
  const after = scanNewline(source, i);
  if (after === i) {
    return raise("ExpectedNewline", "expected a newline after the expression", i, 1);
  }
  return { ...O.getSomesStruct({ comment: O.fromUndefinedOr(comment) }), end: after };
});

/**
 * Skip whitespace, newlines and comments inside array brackets or inline-table
 * braces — the grammar's `ws-comment-newline`, shared by both container
 * parsers since TOML 1.1 let inline tables span lines.
 */
const skipValueGap: {
  (source: string, pos: number): number;
  (pos: number): (source: string) => number;
} = dual(2, (source: string, pos: number): number => {
  let i = pos;
  for (;;) {
    i = scanWhitespace(source, i);
    if (source.charCodeAt(i) === HASH) {
      i = scanComment(source, i).end;
      continue;
    }
    const after = scanNewline(source, i);
    if (after !== i) {
      i = after;
      continue;
    }
    return i;
  }
});

/** Whether a token that classified as `number` spells a float (never called on hex/oct/bin). */
const isFloatToken = (token: string): boolean =>
  !/^0[xob]/.test(token) && (/[.eE]/.test(token) || token.includes("inf") || token.includes("nan"));

/** Containers nest at most MAX_NESTING_DEPTH deep; the guard fires at the opening bracket. */
const assertNestingDepth = (depth: number, openPos: number): void => {
  if (depth > MAX_NESTING_DEPTH) {
    throw GuardExceeded.new("NestingDepthExceeded", MAX_NESTING_DEPTH, depth, openPos);
  }
};

/** An array still open at EOF is UnterminatedArray. */
const assertArrayOpen = (source: string, i: number, openPos: number): void => {
  if (i >= source.length) {
    raise("UnterminatedArray", "array not closed before end of input", openPos, i - openPos);
  }
};

/** After an array item: `,` continues (false), `]` closes (true), anything else is a lex error. */
const arraySeparatorCloses = (source: string, i: number, openPos: number): boolean => {
  const code = source.charCodeAt(i);
  if (code === COMMA) {
    return false;
  }
  if (code === RIGHT_BRACKET) {
    return true;
  }
  assertArrayOpen(source, i, openPos);
  return raise("UnterminatedArray", "expected , or ] in array", i, 1);
};

/** An array value starting at `[`; `depth` is this array's own nesting count. */
const parseArray: {
  (source: string, openPos: number, depth: number): Parsed<TomlArray>;
  (openPos: number, depth: number): (source: string) => Parsed<TomlArray>;
} = dual(3, (source: string, openPos: number, depth: number): Parsed<TomlArray> => {
  assertNestingDepth(depth, openPos);
  const items: Array<TomlValueNode> = [];
  let i = openPos + 1;
  for (;;) {
    i = skipValueGap(source, i);
    assertArrayOpen(source, i, openPos);
    if (source.charCodeAt(i) === RIGHT_BRACKET) {
      i += 1;
      break;
    }
    const item = parseValue(source, i, depth);
    items.push(item.node);
    i = skipValueGap(source, item.end);
    const closes = arraySeparatorCloses(source, i, openPos);
    i += 1;
    if (closes) {
      break;
    }
  }
  return { node: TomlArray.make({ items, offset: openPos, length: i - openPos }), end: i };
});

/** An inline table still open at EOF is UnterminatedInlineTable. */
const assertInlineTableOpen = (source: string, i: number, openPos: number): void => {
  if (i >= source.length) {
    raise("UnterminatedInlineTable", "inline table not closed before end of input", openPos, i - openPos);
  }
};

/** After an inline entry: `}` closes (true), `,` continues (false), anything else is a lex error. */
const inlineSeparatorCloses = (source: string, i: number, openPos: number): boolean => {
  const code = source.charCodeAt(i);
  if (code === RIGHT_BRACE) {
    return true;
  }
  if (code === COMMA) {
    return false;
  }
  assertInlineTableOpen(source, i, openPos);
  return raise("UnterminatedInlineTable", "expected , or } in inline table", i, 1);
};

/** One `key = value` entry inside an inline table; `keyval-sep` is ws-only. */
const parseInlineEntry = (source: string, entryStart: number, depth: number): Parsed<TomlInlineEntry> => {
  const keyPath = parseKeyPath(source, entryStart);
  const equalsPos = scanWhitespace(source, keyPath.end);
  if (source.charCodeAt(equalsPos) !== EQUALS) {
    raise("ExpectedEquals", "expected = after key", equalsPos, 1);
  }
  const value = parseValue(source, scanWhitespace(source, equalsPos + 1), depth);
  return {
    node: TomlInlineEntry.make({
      keyPath: keyPath.node,
      value: value.node,
      offset: entryStart,
      length: value.end - entryStart,
    }),
    end: value.end,
  };
};

/**
 * An inline table starting at `{`; `depth` is this table's own nesting count.
 * TOML 1.1 grammar: `ws-comment-newline` may sit before each key-value,
 * before each separator and before the closing brace, and a trailing comma is
 * allowed — but `keyval-sep` is still ws-only, so no newline may split a key
 * from its `=` or the `=` from its value.
 */
const parseInlineTable: {
  (source: string, openPos: number, depth: number): Parsed<TomlInlineTable>;
  (openPos: number, depth: number): (source: string) => Parsed<TomlInlineTable>;
} = dual(3, (source: string, openPos: number, depth: number): Parsed<TomlInlineTable> => {
  assertNestingDepth(depth, openPos);
  const entries: Array<TomlInlineEntry> = [];
  let i = openPos + 1;
  for (;;) {
    i = skipValueGap(source, i);
    assertInlineTableOpen(source, i, openPos);
    if (source.charCodeAt(i) === RIGHT_BRACE) {
      i += 1;
      break;
    }
    const entry = parseInlineEntry(source, i, depth);
    entries.push(entry.node);
    i = skipValueGap(source, entry.end);
    const closes = inlineSeparatorCloses(source, i, openPos);
    i += 1;
    if (closes) {
      break;
    }
  }
  return { node: TomlInlineTable.make({ entries, offset: openPos, length: i - openPos }), end: i };
});

/** Wrap a classified scalar token into its value node. */
const scalarNode: {
  (source: string, pos: number): Parsed<TomlValueNode>;
  (pos: number): (source: string) => Parsed<TomlValueNode>;
} = dual(2, (source: string, pos: number): Parsed<TomlValueNode> => {
  const token = scanValueToken(source, pos);
  const scalar = classifyValueToken(token.value, pos);
  const length = token.end - pos;
  if (P.isBoolean(scalar)) {
    return { node: TomlBoolean.make({ value: scalar, offset: pos, length }), end: token.end };
  }
  if (P.isBigInt(scalar)) {
    return { node: TomlInteger.make({ value: scalar, offset: pos, length }), end: token.end };
  }
  if (P.isNumber(scalar)) {
    const node = isFloatToken(token.value)
      ? TomlFloat.make({ value: scalar, offset: pos, length })
      : TomlInteger.make({ value: scalar, offset: pos, length });
    return { node, end: token.end };
  }
  return { node: TomlDateTimeLiteral.make({ value: scalar, offset: pos, length }), end: token.end };
});

/** Characters that can never start a value: line ends, comments, separators and closers. */
const isNonValueStart = (code: number): boolean =>
  code === LF ||
  code === CR ||
  code === HASH ||
  code === COMMA ||
  code === EQUALS ||
  code === RIGHT_BRACKET ||
  code === RIGHT_BRACE;

/** Whether the delimiter at `pos` is tripled, opening a multiline string. */
const isTripled = (source: string, pos: number, delimiter: number): boolean =>
  source.charCodeAt(pos + 1) === delimiter && source.charCodeAt(pos + 2) === delimiter;

/** A string value node over a scanned string token starting at `pos`. */
const stringNode = (scanned: ScanResult<string>, style: TomlString["style"], pos: number): Parsed<TomlValueNode> => ({
  node: TomlString.make({ value: scanned.value, style, offset: pos, length: scanned.end - pos }),
  end: scanned.end,
});

/** A basic (`"`) or multiline basic (`"""`) string value. */
const parseBasicStringValue = (source: string, pos: number): Parsed<TomlValueNode> =>
  isTripled(source, pos, QUOTE)
    ? stringNode(scanMultilineBasicString(source, pos), "multiline-basic", pos)
    : stringNode(scanBasicString(source, pos), "basic", pos);

/** A literal (`'`) or multiline literal (`'''`) string value. */
const parseLiteralStringValue = (source: string, pos: number): Parsed<TomlValueNode> =>
  isTripled(source, pos, APOSTROPHE)
    ? stringNode(scanMultilineLiteralString(source, pos), "multiline-literal", pos)
    : stringNode(scanLiteralString(source, pos), "literal", pos);

/** A value at `pos`; `depth` is the number of containers already enclosing it. */
const parseValue: {
  (source: string, pos: number, depth: number): Parsed<TomlValueNode>;
  (pos: number, depth: number): (source: string) => Parsed<TomlValueNode>;
} = dual(3, (source: string, pos: number, depth: number): Parsed<TomlValueNode> => {
  const code = source.charCodeAt(pos);
  if (pos >= source.length || isNonValueStart(code)) {
    return raise("ExpectedValue", "expected a value", pos, 1);
  }
  if (code === QUOTE) {
    return parseBasicStringValue(source, pos);
  }
  if (code === APOSTROPHE) {
    return parseLiteralStringValue(source, pos);
  }
  if (code === LEFT_BRACKET) {
    return parseArray(source, pos, depth + 1);
  }
  if (code === LEFT_BRACE) {
    return parseInlineTable(source, pos, depth + 1);
  }
  return scalarNode(source, pos);
});

/** One `key = value` expression line; returns the position after its newline. */
const parseKeyValueExpression: {
  (source: string, lineStart: number, keyStart: number): Parsed<TomlKeyValue>;
  (lineStart: number, keyStart: number): (source: string) => Parsed<TomlKeyValue>;
} = dual(3, (source: string, lineStart: number, keyStart: number): Parsed<TomlKeyValue> => {
  const keyPath = parseKeyPath(source, keyStart);
  const equalsPos = scanWhitespace(source, keyPath.end);
  if (source.charCodeAt(equalsPos) !== EQUALS) {
    raise("ExpectedEquals", "expected = after key", equalsPos, 1);
  }
  const valueStart = scanWhitespace(source, equalsPos + 1);
  const value = parseValue(source, valueStart, 0);
  const lineEnd = parseLineEnd(source, value.end);
  return {
    node: TomlKeyValue.make({
      keyPath: keyPath.node,
      value: value.node,
      ...O.getSomesStruct({ comment: O.fromUndefinedOr(lineEnd.comment) }),
      offset: lineStart,
      length: lineEnd.end - lineStart,
    }),
    end: lineEnd.end,
  };
});

/** The position past a `]]` closing an array-of-tables header at `i`. */
const closeArrayTableHeader = (source: string, i: number): number => {
  if (source.charCodeAt(i) !== RIGHT_BRACKET || source.charCodeAt(i + 1) !== RIGHT_BRACKET) {
    raise("ExpectedTableHeaderClose", "expected ]] to close the array-of-tables header", i, 1);
  }
  return i + 2;
};

/** The position past a `]` closing a table header at `i`. */
const closeTableHeader = (source: string, i: number): number => {
  if (source.charCodeAt(i) !== RIGHT_BRACKET) {
    raise("ExpectedTableHeaderClose", "expected ] to close the table header", i, 1);
  }
  return i + 1;
};

/** One `[table]` or `[[array-of-tables]]` header line. */
const parseHeaderExpression: {
  (source: string, lineStart: number, bracketPos: number): Parsed<TomlTableHeader | TomlArrayTableHeader>;
  (lineStart: number, bracketPos: number): (source: string) => Parsed<TomlTableHeader | TomlArrayTableHeader>;
} = dual(3, (source: string, lineStart: number, bracketPos: number): Parsed<TomlTableHeader | TomlArrayTableHeader> => {
  const isArrayTable = source.charCodeAt(bracketPos + 1) === LEFT_BRACKET;
  const keyStart = scanWhitespace(source, bracketPos + (isArrayTable ? 2 : 1));
  const keyPath = parseKeyPath(source, keyStart);
  const closePos = scanWhitespace(source, keyPath.end);
  const lineEnd = parseLineEnd(
    source,
    isArrayTable ? closeArrayTableHeader(source, closePos) : closeTableHeader(source, closePos)
  );
  const fields = {
    keyPath: keyPath.node,
    ...O.getSomesStruct({ comment: O.fromUndefinedOr(lineEnd.comment) }),
    offset: lineStart,
    length: lineEnd.end - lineStart,
  };
  return { node: isArrayTable ? TomlArrayTableHeader.make(fields) : TomlTableHeader.make(fields), end: lineEnd.end };
});

/** Whether the line's first non-ws character at `i` makes it blank or comment-only (EOF included). */
const isTriviaLine = (source: string, i: number): boolean => {
  const code = source.charCodeAt(i);
  return i >= source.length || code === LF || code === CR || code === HASH;
};

/** The position after a blank or comment-only line whose content starts at `i`. */
const triviaLineEnd = (source: string, i: number): number => {
  const contentEnd = source.charCodeAt(i) === HASH ? scanComment(source, i).end : i;
  return contentEnd < source.length ? scanNewline(source, contentEnd) : contentEnd;
};

/** One header or key-value expression line whose content starts at `i`. */
const parseExpressionLine = (source: string, lineStart: number, i: number): Parsed<TomlExpression> =>
  source.charCodeAt(i) === LEFT_BRACKET
    ? parseHeaderExpression(source, lineStart, i)
    : parseKeyValueExpression(source, lineStart, i);

/**
 * Parses a TOML document into its linear CST: the flat, source-tiling list of expressions.
 *
 * **Details**
 *
 * Each expression includes its leading whitespace and terminating newline
 * (or ends at EOF); the first expression also includes a leading BOM.
 * Consecutive blank or comment-only lines coalesce into one trivia expression.
 * Concatenating the expressions' source slices reproduces the source exactly.
 *
 * **Gotchas**
 *
 * Throws RawTomlError on malformed input and GuardExceeded when value nesting
 * exceeds MAX_NESTING_DEPTH; the facade materializes both into typed errors.
 *
 * **Example** (Reconstruct source from expression spans)
 *
 * ```ts
 * import { parseExpressions } from "@beep/toml/internal/parser"
 * import * as A from "effect/Array"
 *
 * const source = "# settings\n\n  enabled = true\n"
 * const expressions = parseExpressions(source)
 * const reconstructed = A.map(expressions, (expression) =>
 *   source.slice(expression.offset, expression.offset + expression.length)
 * ).join("")
 * console.log(reconstructed === source) // true
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const parseExpressions = (source: string): ReadonlyArray<TomlExpression> => {
  assertValidUnicode(source);
  const expressions: Array<TomlExpression> = [];
  let triviaStart = -1;
  const flushTrivia = (end: number): void => {
    if (triviaStart !== -1) {
      expressions.push(
        TomlTrivia.make({ text: source.slice(triviaStart, end), offset: triviaStart, length: end - triviaStart })
      );
      triviaStart = -1;
    }
  };
  let pos = 0;
  while (pos < source.length) {
    const lineStart = pos;
    // the BOM folds into the first line's leading whitespace, keeping the tiling exact
    const i = scanWhitespace(source, lineStart === 0 ? skipBom(source) : lineStart);
    if (isTriviaLine(source, i)) {
      // blank or comment-only line → trivia accumulation
      pos = triviaLineEnd(source, i);
      triviaStart = triviaStart === -1 ? lineStart : triviaStart;
      continue;
    }
    flushTrivia(lineStart);
    const parsed = parseExpressionLine(source, lineStart, i);
    expressions.push(parsed.node);
    pos = parsed.end;
  }
  flushTrivia(source.length);
  return expressions;
};
