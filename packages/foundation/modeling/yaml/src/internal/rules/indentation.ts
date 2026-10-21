// indentation: block-structure indent STYLE — the one rule that
// reasons about structure rather than a token and its neighbours, built
// last by design. Two checks:
//
//   1. Every new block level indents by the same unit (`spaces`: a number,
//      or "consistent" — the first observed delta decides).
//   2. Sequences under a mapping key follow one policy (`indentSequences`:
//      true, false, or "consistent" — the first occurrence decides).
//
// Structural LEGALITY is the parser's job (a dedent to an unknown level is
// a parse error parse-validity reports); this rule only speaks where the
// document is well-formed and the style drifts. Lines inside scalar content
// or flow collections are skipped — their layout is value or flow syntax,
// not block indentation. No fix: reindenting is formatting.

import { $YamlId } from "@beep/identity/packages";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as N from "effect/Number";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { LintLine, StyleVote, YamlLintDiagnostic, YamlLintSeverity, YamlRule } from "../../YamlLintRule.ts";
import { coveringToken, isScalarContinuationLine, nonNegativeIntegerOption, walkScalars } from "./util.ts";
import type { LintContext } from "../../YamlLintRule.ts";
import type { YamlScalar } from "../../YamlNode.ts";
import type { YamlToken } from "../../YamlToken.ts";

const $I = $YamlId.create("internal/rules/indentation");

/**
 * Configure the indentation unit and placement of sequences beneath mapping keys.
 *
 * **Details**
 *
 * Options for `indentation`: `spaces` per level (number or "consistent",
 * default "consistent") and `indentSequences` (boolean or "consistent",
 * default "consistent").
 *
 * **Example** (Decode indentation options)
 *
 * ```ts
 * import * as S from "effect/Schema";
 * import { indentationOptions } from "@beep/yaml/internal/rules/indentation";
 *
 * const options = S.decodeUnknownSync(indentationOptions)({ spaces: 2, indentSequences: true });
 * console.log(options.spaces) // 2
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class indentationOptions extends S.Opaque<indentationOptions, { readonly brand: unique symbol }>()(
  S.Struct({
    severity: S.optionalKey(YamlLintSeverity).pipe(
      $I.annoteKey("indentationOptions.severity", {
        description: "Reporting level for block-indentation style findings, defaulting to `error`",
      })
    ),
    spaces: S.optionalKey(S.Union([nonNegativeIntegerOption, S.Literals(["consistent"])])).pipe(
      $I.annoteKey("indentationOptions.spaces", {
        description:
          "Spaces per block-indentation level, or `consistent` to use the first observed increase; defaults to `consistent`",
      })
    ),
    indentSequences: S.optionalKey(S.Union([S.Boolean, S.Literals(["consistent"])])).pipe(
      $I.annoteKey("indentationOptions.indentSequences", {
        description:
          "Whether sequences indent beneath mapping keys, or `consistent` to follow the first observed placement; defaults to `consistent`",
      })
    ),
  }).pipe(
    $I.annoteSchema("indentationOptions", {
      description:
        'Options for `indentation`: `spaces` per level (number or "consistent", default "consistent") and `indentSequences` (boolean or "consistent", default "consistent").',
    })
  )
) {}

const ContentLine = S.Struct({
  line: LintLine.pipe(
    $I.annoteKey("ContentLine.line", { description: "Positioned source line contributing block structure" })
  ),
  prefixWidth: nonNegativeIntegerOption.pipe(
    $I.annoteKey("ContentLine.prefixWidth", { description: "Initial stream BOM width excluded from indentation" })
  ),
  propertiesOnly: S.Boolean.pipe(
    $I.annoteKey("ContentLine.propertiesOnly", { description: "Whether the line contains only node anchors and tags" })
  ),
  indent: nonNegativeIntegerOption.pipe(
    $I.annoteKey("ContentLine.indent", { description: "Leading indentation column of the line" })
  ),
  firstChar: S.String.pipe(
    $I.annoteKey("ContentLine.firstChar", { description: "First non-whitespace character on the line" })
  ),
  indents: S.NonEmptyArray(nonNegativeIntegerOption).pipe(
    $I.annoteKey("ContentLine.indents", {
      description: "Line indentation followed by the innermost same-line compact collection columns",
    })
  ),
  opensKey: S.Boolean.pipe(
    $I.annoteKey("ContentLine.opensKey", {
      description: "Whether the mapping separator has no same-line value content",
    })
  ),
}).pipe(
  $I.annoteSchema("ContentLine", {
    description: "A structural line with a nonempty progression of nonnegative indentation columns",
  })
);
type ContentLine = typeof ContentLine.Type;

/** Net flow-collection depth change contributed by one token kind. */
const flowDepthDelta = (kind: YamlToken["kind"]): number => {
  if (kind === "flow-map-start" || kind === "flow-seq-start") return 1;
  if (kind === "flow-map-end" || kind === "flow-seq-end") return -1;
  return 0;
};

type FlowCursor = { index: number; depth: number };

/** Advance through tokens that END at or before `lineOffset`, tracking flow depth. */
const advanceFlowCursor = (tokens: ReadonlyArray<YamlToken>, cursor: FlowCursor, lineOffset: number): number => {
  while (cursor.index < tokens.length) {
    const token = A.getUnsafe(tokens, cursor.index);
    if (token.offset + token.length > lineOffset) break;
    cursor.depth = Math.max(0, cursor.depth + flowDepthDelta(token.kind));
    cursor.index++;
  }
  return cursor.depth;
};

/** Flow-collection depth at each line start, from the token stream. */
const flowDepthAtLineStarts = (ctx: LintContext): ReadonlyArray<number> => {
  const cursor: FlowCursor = { index: 0, depth: 0 };
  return A.map(ctx.lines, (line) => advanceFlowCursor(ctx.tokens, cursor, line.offset));
};

/** Cross-line cursors shared by every line of one {@link contentLines} pass. */
type ContentScan = {
  readonly tokens: ReadonlyArray<YamlToken>;
  readonly scalarSpans: ReadonlyArray<YamlScalar>;
  scalarIdx: number;
  tokenIdx: number;
  explicitKeyColumn: number | undefined;
};

/** Per-line token-scan state for {@link scanLineTokens}. */
type LineScan = {
  readonly indents: A.NonEmptyArray<number>;
  readonly prefixWidth: number;
  opensKey: boolean;
  propertiesOnly: boolean;
  hasBlockIndicator: boolean;
  afterEntry: boolean;
  compactKeyIndent: number | undefined;
  inlineFlowDepth: number;
};

/** Leading characters of lines that carry no block structure. */
const isSkippedLeader = (firstChar: string): boolean =>
  // blank, comment lines, directives, and tab indent (the parser's error)
  firstChar === "#" || firstChar === "%" || firstChar === "\t";

/** Width of the initial stream BOM excluded from indentation. */
const bomPrefixWidth = (line: LintLine): number => (line.offset === 0 && line.text[0] === "\uFEFF" ? 1 : 0);

/** Count the leading spaces after `prefixWidth`. */
const leadingSpaces = (text: string, prefixWidth: number): number => {
  let indent = 0;
  while (text[prefixWidth + indent] === " ") indent++;
  return indent;
};

/** True when `probeOffset` lies inside a multi-line scalar that began before the line. */
const insideMultilineScalar = (scan: ContentScan, lineOffset: number, probeOffset: number): boolean => {
  const spans = scan.scalarSpans;
  while (scan.scalarIdx < spans.length) {
    const scalar = A.getUnsafe(spans, scan.scalarIdx);
    if (scalar.offset + scalar.length > probeOffset) break;
    scan.scalarIdx++;
  }
  const scalar = spans[scan.scalarIdx];
  return scalar !== undefined && scalar.offset < lineOffset && probeOffset < scalar.offset + scalar.length;
};

const isDocumentMarker = (token: YamlToken | undefined): boolean =>
  token?.kind === "document-start" || token?.kind === "document-end";

const isNodeProperty = (kind: YamlToken["kind"]): boolean => kind === "anchor" || kind === "tag";

const isBlockIndicator = (kind: YamlToken["kind"]): boolean =>
  kind === "block-map-key" || kind === "block-map-value" || kind === "block-seq-entry";

/** After a `- ` entry, record a nested compact entry column or a pending compact key column. */
const recordCompactColumn = (line: LineScan, token: YamlToken): void => {
  const column = token.character - line.prefixWidth;
  if (token.kind === "block-seq-entry" || token.kind === "block-map-key") line.indents.push(column);
  else line.compactKeyIndent = column;
};

/** A block `:` confirms a pending compact key column as a nesting level. */
const flushCompactKey = (line: LineScan, kind: YamlToken["kind"]): void => {
  if (kind !== "block-map-value" || line.inlineFlowDepth !== 0 || line.compactKeyIndent === undefined) return;
  line.indents.push(line.compactKeyIndent);
  line.compactKeyIndent = undefined;
};

/** Track explicit-key columns and block indicators outside inline flow collections. */
const trackBlockIndicator = (scan: ContentScan, line: LineScan, token: YamlToken): void => {
  if (line.inlineFlowDepth !== 0) return;
  if (token.kind === "block-map-key") scan.explicitKeyColumn = token.character - line.prefixWidth;
  if (token.kind === "block-map-value") scan.explicitKeyColumn = undefined;
  if (isBlockIndicator(token.kind)) line.hasBlockIndicator = true;
};

/** Whether the line so far ends in a block `:` with only node properties after it. */
const nextOpensKey = (line: LineScan, kind: YamlToken["kind"]): boolean => {
  if (kind === "block-map-value" && line.inlineFlowDepth === 0) return true;
  return isNodeProperty(kind) ? line.opensKey : false;
};

/** Fold one significant token into the line scan. */
const stepLineToken = (scan: ContentScan, line: LineScan, token: YamlToken): void => {
  if (token.length === 0 || token.kind === "whitespace" || token.kind === "comment") return;
  if (!isNodeProperty(token.kind)) line.propertiesOnly = false;
  line.inlineFlowDepth += flowDepthDelta(token.kind);
  if (line.afterEntry) recordCompactColumn(line, token);
  flushCompactKey(line, token.kind);
  trackBlockIndicator(scan, line, token);
  line.afterEntry = token.kind === "block-seq-entry";
  line.opensKey = nextOpensKey(line, token.kind);
};

/** Read the significant tokens of one line, rather than treating quoted ` # ` as a comment. */
const scanLineTokens = (scan: ContentScan, line: LintLine, indent: number, prefixWidth: number): LineScan => {
  const tokens = scan.tokens;
  while (scan.tokenIdx < tokens.length && A.getUnsafe(tokens, scan.tokenIdx).offset < line.offset) scan.tokenIdx++;
  const lineScan: LineScan = {
    indents: A.of(indent),
    prefixWidth,
    opensKey: false,
    propertiesOnly: true,
    hasBlockIndicator: false,
    afterEntry: false,
    compactKeyIndent: undefined,
    inlineFlowDepth: 0,
  };
  const lineEnd = line.offset + line.text.length;
  while (scan.tokenIdx < tokens.length) {
    const token = A.getUnsafe(tokens, scan.tokenIdx);
    if (token.offset >= lineEnd) break;
    scan.tokenIdx++;
    stepLineToken(scan, lineScan, token);
  }
  return lineScan;
};

/**
 * Explicit plain keys can be composed from separate tokens while their
 * AST span still covers only the first fragment. Keep the later ':'
 * structural, but omit deeper scalar fragments until that indicator.
 */
const isExplicitKeyFragment = (
  continuationKeyColumn: number | undefined,
  indent: number,
  firstToken: YamlToken | undefined,
  lineScan: LineScan
): boolean =>
  continuationKeyColumn !== undefined &&
  indent > continuationKeyColumn &&
  firstToken?.kind === "scalar" &&
  !lineScan.hasBlockIndicator;

/** Close an explicit-key continuation once a line dedents to or past its column. */
const takeContinuationKeyColumn = (scan: ContentScan, indent: number): number | undefined => {
  const continuationKeyColumn = scan.explicitKeyColumn;
  if (continuationKeyColumn !== undefined && indent <= continuationKeyColumn) scan.explicitKeyColumn = undefined;
  return continuationKeyColumn;
};

/** True when the line is inside a flow collection or continues scalar content. */
const isNonStructuralLine = (
  ctx: LintContext,
  scan: ContentScan,
  flowDepths: ReadonlyArray<number>,
  line: LintLine,
  probeOffset: number
): boolean =>
  A.getUnsafe(flowDepths, line.number) > 0 ||
  isScalarContinuationLine(ctx.tokens, line.offset, probeOffset) ||
  insideMultilineScalar(scan, line.offset, probeOffset);

/** Classify one source line as a structural content line, or skip it. */
const contentLine = (
  ctx: LintContext,
  scan: ContentScan,
  flowDepths: ReadonlyArray<number>,
  line: LintLine
): ContentLine | undefined => {
  const prefixWidth = bomPrefixWidth(line);
  const indent = leadingSpaces(line.text, prefixWidth);
  const probeOffset = line.offset + prefixWidth + indent;
  const firstChar = line.text[prefixWidth + indent];
  if (firstChar === undefined || isSkippedLeader(firstChar)) return undefined;
  if (isNonStructuralLine(ctx, scan, flowDepths, line, probeOffset)) return undefined;
  const firstToken = coveringToken(ctx.tokens, probeOffset);
  if (isDocumentMarker(firstToken)) {
    scan.explicitKeyColumn = undefined;
    return undefined;
  }
  const continuationKeyColumn = takeContinuationKeyColumn(scan, indent);
  const lineScan = scanLineTokens(scan, line, indent, prefixWidth);
  if (isExplicitKeyFragment(continuationKeyColumn, indent, firstToken, lineScan)) return undefined;
  const { indents, opensKey, propertiesOnly } = lineScan;
  return { line, indent, firstChar, indents, opensKey, prefixWidth, propertiesOnly };
};

/** Multi-line scalars of the document, ordered by offset. */
const multilineScalarSpans = (ctx: LintContext): ReadonlyArray<YamlScalar> => {
  const multilineScalars: Array<YamlScalar> = [];
  walkScalars(ctx.document.contents, "root", (scalar) => {
    if (scalar.sourceMultiline === true) multilineScalars.push(scalar);
  });
  return A.sortWith(multilineScalars, (scalar) => scalar.offset, N.Order);
};

/**
 * The content lines block structure speaks about — shared by the check and
 * the inference hook so the two read the same lines. Skips blanks, comment
 * lines, directives, tab-indented lines (the parser's error), lines inside
 * flow collections, scalar continuations and document markers.
 */
const contentLines = (ctx: LintContext): ReadonlyArray<ContentLine> => {
  const flowDepths = flowDepthAtLineStarts(ctx);
  const scan: ContentScan = {
    tokens: ctx.tokens,
    scalarSpans: multilineScalarSpans(ctx),
    scalarIdx: 0,
    tokenIdx: 0,
    explicitKeyColumn: undefined,
  };
  const content: Array<ContentLine> = [];
  for (const line of ctx.lines) {
    const entry = contentLine(ctx, scan, flowDepths, line);
    if (entry !== undefined) content.push(entry);
  }
  return content;
};

/** One block-level indent increase observed on a content line's first column. */
type IndentIncrease = {
  readonly line: ContentLine["line"];
  readonly prefixWidth: number;
  readonly indent: number;
  readonly delta: number;
};

/** Apply one content line's indentation columns to the level stack, recording an increase. */
const applyLineIndents = (stack: Array<number>, increases: Array<IndentIncrease>, entry: ContentLine): void => {
  const { line, indents, prefixWidth } = entry;
  const indent = A.headNonEmpty(indents);
  const top = A.getUnsafe(stack, stack.length - 1);
  if (indent > top) {
    increases.push({ line, prefixWidth, indent, delta: indent - top });
    stack.push(indent);
  } else {
    // A dedent to an unknown level is a parse error — parse-validity's
    // business, not style.
    while (stack.length > 1 && A.getUnsafe(stack, stack.length - 1) > indent) stack.pop();
  }
  for (let columnIndex = 1; columnIndex < indents.length; columnIndex++) stack.push(A.getUnsafe(indents, columnIndex));
};

/** Every block-level indent increase across the content lines, in source order. */
const indentIncreases = (content: ReadonlyArray<ContentLine>): ReadonlyArray<IndentIncrease> => {
  const stack: Array<number> = [0];
  const increases: Array<IndentIncrease> = [];
  for (const entry of content) applyLineIndents(stack, increases, entry);
  return increases;
};

/** A mapping-key line followed by a sequence-entry line, with the entry's placement. */
type KeySeqPair = { readonly curr: ContentLine; readonly indented: boolean };

/** Content-line pairs `key:` → `- item`, looking past node properties. */
const keySeqPairs = (
  ctx: LintContext,
  content: ReadonlyArray<ContentLine>,
  unit: number
): ReadonlyArray<KeySeqPair> => {
  const pairedContent = A.filter(content, (line) => !line.propertiesOnly);
  const pairs: Array<KeySeqPair> = [];
  for (let i = 1; i < pairedContent.length; i++) {
    const prev = A.getUnsafe(pairedContent, i - 1);
    const curr = A.getUnsafe(pairedContent, i);
    if (!isKeyThenSeqEntry(ctx, prev, curr, unit)) continue;
    pairs.push({ curr, indented: curr.indent > A.getUnsafe(prev.indents, prev.indents.length - 1) });
  }
  return pairs;
};

/**
 * True when consecutive content lines `prev` → `curr` are a mapping key
 * followed by a sequence entry — the pair the `indentSequences` policy is
 * about. Shared by the check and the inference hook.
 */
const isKeyThenSeqEntry: {
  (ctx: LintContext, prev: ContentLine, curr: ContentLine, unit: number): boolean;
  (prev: ContentLine, curr: ContentLine, unit: number): (ctx: LintContext) => boolean;
} = dual(4, (ctx: LintContext, prev: ContentLine, curr: ContentLine, unit: number): boolean => {
  if (curr.firstChar !== "-") return false;
  // A leading `-` is not necessarily a sequence entry: `-5` and `--flag`
  // are plain scalars (YAML 1.2 §7.1). The lexer already knows — only a
  // line whose first content token is `block-seq-entry` is one.
  if (coveringToken(ctx.tokens, curr.line.offset + curr.prefixWidth + curr.indent)?.kind !== "block-seq-entry")
    return false;
  if (!prev.opensKey) return false;
  const keyIndent = A.getUnsafe(prev.indents, prev.indents.length - 1);
  return curr.indent === keyIndent || curr.indent === keyIndent + unit;
});

/** The configured `spaces` option, defaulting to "consistent". */
const readSpacesOption = (options: unknown): number | "consistent" =>
  P.hasProperty(options, "spaces") && S.is(indentationOptions.fields.spaces.schema)(options.spaces)
    ? options.spaces
    : "consistent";

/** The configured `indentSequences` option, defaulting to "consistent". */
const readSequencesOption = (options: unknown): boolean | "consistent" =>
  P.hasProperty(options, "indentSequences") &&
  S.is(indentationOptions.fields.indentSequences.schema)(options.indentSequences)
    ? options.indentSequences
    : "consistent";

/** Report increases that differ from the configured or first observed unit. */
const unitFindings = (
  increases: ReadonlyArray<IndentIncrease>,
  configured: number | undefined
): { readonly unit: number | undefined; readonly out: Array<YamlLintDiagnostic> } => {
  let unit = configured;
  const out: Array<YamlLintDiagnostic> = [];
  for (const { line, prefixWidth, indent, delta } of increases) {
    if (unit === undefined) {
      unit = delta;
      continue;
    }
    if (delta === unit) continue;
    out.push(
      YamlLintDiagnostic.make({
        rule: "indentation",
        severity: "error",
        message: `Indent of ${delta} spaces, expected ${unit}`,
        offset: line.offset + prefixWidth,
        length: indent,
        line: line.number,
        character: prefixWidth,
      })
    );
  }
  return { unit, out };
};

/** Report key-to-sequence pairs that break the configured or first observed placement. */
const sequenceFindings = (
  pairs: ReadonlyArray<KeySeqPair>,
  seqOpt: boolean | "consistent"
): Array<YamlLintDiagnostic> => {
  let seqIndented = P.isBoolean(seqOpt) ? seqOpt : undefined;
  const out: Array<YamlLintDiagnostic> = [];
  for (const { curr, indented } of pairs) {
    if (seqIndented === undefined) {
      seqIndented = indented;
      continue;
    }
    if (indented === seqIndented) continue;
    out.push(
      YamlLintDiagnostic.make({
        rule: "indentation",
        severity: "error",
        message: seqIndented
          ? "Sequence under a mapping key should be indented"
          : "Sequence under a mapping key should not be indented",
        offset: curr.line.offset + curr.prefixWidth,
        length: curr.indent,
        line: curr.line.number,
        character: curr.prefixWidth,
      })
    );
  }
  return out;
};

/**
 * Check block-structure indentation style.
 *
 * **Details**
 *
 * The rule checks the indentation unit and sequence placement under mapping
 * keys. In consistent mode, the first observed increase determines the unit
 * and the first key-to-sequence pair determines sequence placement. Scalar
 * continuations and flow collections are skipped. Inference votes on the same
 * content lines used by the check.
 *
 * **Gotchas**
 *
 * Structural legality belongs to the parser. This rule reports style drift
 * and offers no fix: reindenting is formatting.
 *
 * **Example** (Find an indentation-unit mismatch)
 *
 * ```ts
 * import { indentation } from "@beep/yaml/internal/rules/indentation";
 * import { YamlLint, YamlLintConfig } from "@beep/yaml/YamlLint";
 *
 * const config = YamlLintConfig.make({
 *   rules: { "indentation": { spaces: 2 } },
 * });
 * const diagnostics = YamlLint.run("parent:\n    child: value\n", [indentation], config);
 * console.log(diagnostics.length) // 1
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const indentation = YamlRule.make({
  id: "indentation",
  check: dual(2, (ctx: LintContext, options: unknown): Iterable<YamlLintDiagnostic> => {
    // The content lines this rule speaks about.
    const content = contentLines(ctx);
    const spaces = readSpacesOption(options);
    // Check 1: every new level indents by one consistent unit.
    const units = unitFindings(indentIncreases(content), P.isNumber(spaces) ? spaces : undefined);
    // Check 2: sequences under a mapping key follow one policy.
    const sequences = sequenceFindings(keySeqPairs(ctx, content, units.unit ?? 0), readSequencesOption(options));
    return A.appendAll(units.out, sequences);
  }),
  // Inference: every indent INCREASE votes its delta for `spaces`,
  // and every key-then-sequence-entry pair votes whether the sequence is
  // indented for `indentSequences` — the same content lines and the same
  // detection the check polices in "consistent" mode.
  infer: (ctx) => {
    const content = contentLines(ctx);
    const increases = indentIncreases(content);
    const spacesVotes = A.map(increases, ({ line, prefixWidth, indent, delta }) =>
      StyleVote.make({
        dimension: "spaces",
        value: delta,
        offset: line.offset + prefixWidth,
        length: indent,
        line: line.number,
        character: prefixWidth,
      })
    );
    const unit = increases[0]?.delta ?? 0;
    const sequenceVotes = A.map(keySeqPairs(ctx, content, unit), ({ curr, indented }) =>
      StyleVote.make({
        dimension: "indentSequences",
        value: indented,
        offset: curr.line.offset + curr.prefixWidth,
        length: curr.indent,
        line: curr.line.number,
        character: curr.prefixWidth,
      })
    );
    return A.appendAll(spacesVotes, sequenceVotes);
  },
});
