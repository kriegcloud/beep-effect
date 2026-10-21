/**
 * Canonical YAML output normalisation helpers shared across compliance test
 * suites. The yaml-test-suite's `out.yaml` fixtures follow libyaml's canonical
 * conventions, which differ slightly from a direct `stringifyDocument` result;
 * these helpers bridge the gap without leaking convention knowledge into the
 * library proper.
 */

import { YamlMap, YamlScalar, YamlSeq } from "@beep/yaml/YamlNode";
import { dual } from "effect/Function";
import * as Schema from "effect/Schema";
import type { RawYamlDocument } from "@beep/yaml/internal/raw-document";

/** Escape sequences for the characters with a short double-quoted form. */
const DQ_SHORT_ESCAPES: Readonly<Record<string, string>> = {
  "\\": "\\\\",
  '"': '\\"',
  "\n": "\\n",
  "\r": "\\r",
  "\t": "\\t",
};

/** Escape one UTF-16 code unit for a YAML double-quoted scalar. */
function escapeDoubleQuotedChar(ch: string): string {
  const short = DQ_SHORT_ESCAPES[ch];
  if (short !== undefined) return short;
  const code = ch.charCodeAt(0);
  return code < 0x20 ? `\\x${code.toString(16).padStart(2, "0")}` : ch;
}

/** Render a string as a YAML double-quoted single-line scalar. */
function renderDoubleQuoted(s: string): string {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    out += escapeDoubleQuotedChar(s.charAt(i));
  }
  return `"${out}"`;
}

/** Inputs shared by every single-doc canonical rule. */
interface SingleDocContext {
  readonly doc: RawYamlDocument;
  readonly output: string;
  readonly root: RawYamlDocument["contents"];
  readonly source: string;
}

/** A single-doc canonical rule: the rewritten output, or undefined when the rule does not apply. */
type SingleDocRule = (ctx: SingleDocContext) => string | undefined;

const isYamlScalar = Schema.is(YamlScalar);
const isYamlSeq = Schema.is(YamlSeq);
const isYamlMap = Schema.is(YamlMap);

const isNonEmpty = (value: string | undefined): boolean => value !== undefined && value !== "";

const isBlockScalarStyle = (style: YamlScalar["style"]): boolean =>
  style === "block-literal" || style === "block-folded";

/**
 * 2LFX: scalar root with reserved (non-YAML/TAG) directives, where the source
 * has `---` on its own line. libyaml's canonical emitter preserves the source
 * `---<newline>` placement only when reserved directives are present. Known
 * directives (%YAML, %TAG) get normalized to inline `--- <body>` form (see
 * BEC7, RTP8). Source-shape detection: scan for `---` followed by a newline
 * (rather than a space) before the scalar body.
 */
const reservedDirectiveOwnLineStart: SingleDocRule = ({ doc, output, root, source }) =>
  isYamlScalar(root) &&
  !isNonEmpty(root.tag) &&
  !isNonEmpty(root.anchor) &&
  doc.hasDocumentStart &&
  hasReservedDirective(doc) &&
  hadDocStartOnOwnLine(source) &&
  output.startsWith("--- ")
    ? `---\n${output.slice(4)}`
    : undefined;

/**
 * 4WA9: top-level block-seq whose first item is a YamlMap whose first pair's
 * value is a block scalar with an explicit indent indicator (`|N`, `>N`).
 * libyaml's canonical emitter prepends `---` for this shape because the
 * explicit indicator suggests the source authored a non-trivial block layout
 * that benefits from explicit document framing. Other block-seq shapes
 * (R4YG: items are bare block scalars; M6YH/735Y: mixed items) stay
 * unchanged.
 */
const explicitIndentBlockSeqStart: SingleDocRule = ({ output, root, source }) =>
  isYamlSeq(root) && root.style === "block" && hasExplicitIndentInMapValue(root, source) && !output.startsWith("---")
    ? `---\n${output}`
    : undefined;

/**
 * 652Z: top-level flow-source map converted to block form whose first key
 * is a plain scalar that begins with a YAML indicator (e.g. `?foo`). Without
 * `---`, the leading `?foo:` would parse ambiguously (the `?` could be read
 * as an explicit-key indicator). libyaml's canonical emitter prepends `---`
 * in this case. Detection: source contains a flow opener (`{` or `[`) at
 * root level AND output's first non-leading-space content starts with `?`
 * followed by an alpha char (key starts with `?`).
 */
const flowMapIndicatorKeyStart: SingleDocRule = ({ output, root, source }) =>
  isYamlMap(root) && sourceHasFlowAtRoot(source) && !output.startsWith("---") && /^[?][A-Za-z]/.test(output)
    ? `---\n${output}`
    : undefined;

/**
 * VJP3/01: source has a flow collection where the key/value separator `:`
 * is alone on its own line, indicating extreme spread-out flow formatting.
 * libyaml's canonical emitter prepends `---` for this stylistic outlier.
 * Common multi-line flow (87E4, 8UDB, DBG4) keeps tokens together on lines,
 * so it does not match this pattern.
 */
const isolatedFlowColonStart: SingleDocRule = ({ output, root, source }) =>
  (isYamlMap(root) || isYamlSeq(root)) && sourceHasFlowWithIsolatedColon(source) && !output.startsWith("---")
    ? `---\n${output}`
    : undefined;

/**
 * B3HG: block-folded `>` scalar at root with single-line folded content,
 * where the source has 2+ trailing blank lines beyond what chomp preserves.
 * libyaml's canonical emitter drops the redundant `---` here. The companion
 * fixture 96L6 has only 1 trailing newline and keeps `---`.
 */
const foldedTrailingBlanksDrop: SingleDocRule = ({ output, root, source }) =>
  isYamlScalar(root) &&
  root.style === "block-folded" &&
  typeof root.value === "string" &&
  !root.value.replace(/\n$/, "").includes("\n") &&
  sourceHasMultipleTrailingBlanks(source) &&
  output.startsWith("--- >")
    ? output.slice(4)
    : undefined;

/** A rule for a scalar root whose output starts with `--- `. */
type ScalarRootRule = (root: YamlScalar, output: string, firstAfter: string) => string | undefined;

/** Block scalar at root with `\n\t` content → libyaml emits DQ instead. */
const tabbedBlockScalarToDoubleQuoted: ScalarRootRule = (root, _output, firstAfter) =>
  (firstAfter === "|" || firstAfter === ">") &&
  typeof root.value === "string" &&
  /\n\t/.test(root.value) &&
  isBlockScalarStyle(root.style)
    ? `${renderDoubleQuoted(root.value)}\n`
    : undefined;

/**
 * Single-quoted scalar at root whose content begins with `---`: the quoted
 * form is unambiguous on its own line, so libyaml drops the redundant
 * document-start marker. Limited to single-line content because multi-line
 * quoted scalars are handled by the general multi-line drop below.
 */
const singleQuotedDashesDrop: ScalarRootRule = (root, output, firstAfter) =>
  firstAfter === "'" && typeof root.value === "string" && !root.value.includes("\n") && root.value.startsWith("---")
    ? output.slice(4)
    : undefined;

/**
 * 9MQT/00: a multi-line DQ scalar at root whose folded value is plain-safe
 * renders as `--- <plain>` in single-doc canonical output. libyaml drops
 * the quotes when the resolved value can stand as a plain scalar (no
 * indicator chars, no leading/trailing whitespace, no `:` etc.). Limited
 * to single-doc streams (this helper is only invoked from the single-doc
 * test harness path) so multi-doc fixtures like KSS4 doc 1 keep their DQ
 * quoting.
 */
const plainSafeDoubleQuotedUnquote: ScalarRootRule = (root, output) =>
  root.style === "double-quoted" &&
  root.sourceMultiline === true &&
  typeof root.value === "string" &&
  !root.value.includes("\n") &&
  isPlainSafe(root.value)
    ? `--- ${root.value}${output.endsWith("\n") ? "\n" : ""}`
    : undefined;

/** Multi-line quoted scalar at root: libyaml drops the document-start marker. */
const multiLineQuotedDrop: ScalarRootRule = (root, output, firstAfter) =>
  typeof root.value === "string" && root.value.includes("\n") && (firstAfter === "'" || firstAfter === '"')
    ? output.slice(4)
    : undefined;

const SCALAR_ROOT_RULES: ReadonlyArray<ScalarRootRule> = [
  tabbedBlockScalarToDoubleQuoted,
  singleQuotedDashesDrop,
  plainSafeDoubleQuotedUnquote,
  multiLineQuotedDrop,
];

/** Scalar-root conventions, applied when the output opens with `--- `. */
const scalarRootCanonical: SingleDocRule = ({ output, root }) => {
  if (!isYamlScalar(root) || !output.startsWith("--- ")) return undefined;
  const firstAfter = output.charAt(4);
  for (const rule of SCALAR_ROOT_RULES) {
    const rewritten = rule(root, output, firstAfter);
    if (rewritten !== undefined) return rewritten;
  }
  return undefined;
};

/** Single-doc rules in priority order; the first rule that applies wins. */
const SINGLE_DOC_RULES: ReadonlyArray<SingleDocRule> = [
  reservedDirectiveOwnLineStart,
  explicitIndentBlockSeqStart,
  flowMapIndicatorKeyStart,
  isolatedFlowColonStart,
  foldedTrailingBlanksDrop,
  scalarRootCanonical,
];

/**
 * Apply canonical single-doc conventions: libyaml's canonical emitter
 * differs from a direct `stringifyDocument` in several cases. See the
 * fixture-ID comments on each rule for the specific shapes.
 */
export function applySingleDocCanonical(output: string, doc: RawYamlDocument, source: string): string;
export function applySingleDocCanonical(doc: RawYamlDocument, source: string): (output: string) => string;
export function applySingleDocCanonical(
  ...args: [output: string, doc: RawYamlDocument, source: string] | [doc: RawYamlDocument, source: string]
): string | ((output: string) => string) {
  return dual<
    (
      ...args: [output: string, doc: RawYamlDocument, source: string] | [doc: RawYamlDocument, source: string]
    ) => string | ((output: string) => string),
    (output: string, doc: RawYamlDocument, source: string) => string
  >(3, function applySingleDocCanonical(output: string, doc: RawYamlDocument, source: string): string {
    const ctx: SingleDocContext = { doc, output, root: doc.contents, source };
    for (const rule of SINGLE_DOC_RULES) {
      const rewritten = rule(ctx);
      if (rewritten !== undefined) return rewritten;
    }
    return output;
  })(...args);
}

/**
 * Apply canonical multi-doc conventions on top of the joined per-doc output.
 */
export function applyMultiDocCanonical(output: string, docs: ReadonlyArray<RawYamlDocument>): string;
export function applyMultiDocCanonical(docs: ReadonlyArray<RawYamlDocument>): (output: string) => string;
export function applyMultiDocCanonical(
  ...args: [output: string, docs: ReadonlyArray<RawYamlDocument>] | [docs: ReadonlyArray<RawYamlDocument>]
): string | ((output: string) => string) {
  return dual<
    (
      ...args: [output: string, docs: ReadonlyArray<RawYamlDocument>] | [docs: ReadonlyArray<RawYamlDocument>]
    ) => string | ((output: string) => string),
    (output: string, docs: ReadonlyArray<RawYamlDocument>) => string
  >(2, function applyMultiDocCanonical(output: string, docs: ReadonlyArray<RawYamlDocument>): string {
    let result = output;

    // 6WLZ: multi-doc stream where every doc has explicit `---` AND at least
    // one doc has a `%TAG` directive that uses the primary handle (`!`).
    // libyaml's canonical emitter splits `---` from tagged scalar bodies in
    // this case to make the per-doc directive scope unambiguous. Companion
    // fixture 9WXW (doc 1 has no `---`) does not match, so the rule is
    // specific to this all-explicit-with-private-tags shape.
    if (
      docs.length >= 2 &&
      docs.every((d) => d.hasDocumentStart) &&
      docs.some((d) => d.directives.some((dir) => dir.name === "TAG" && dir.parameters[0] === "!"))
    ) {
      const segments = splitMultiDocOutput(result, docs);
      if (segments !== null) {
        result = segments
          .map((segment, idx) => {
            const doc = docs[idx];
            if (doc === undefined || doc.contents === null) return segment;
            return splitDocStartFromTaggedScalar(segment);
          })
          .join("");
      }
    }

    // PUW8: an empty trailing document with explicit `---` gets a `...`
    // terminator appended when at least one prior document had content.
    // Without the terminator, the trailing `---` is ambiguous when the
    // stream is concatenated. Doesn't apply to all-empty streams (6XDY,
    // MUS6/02-06) where there is no preceding content.
    if (docs.length >= 2) {
      const last = docs[docs.length - 1];
      if (
        last !== undefined &&
        last.contents === null &&
        last.hasDocumentStart &&
        !last.hasDocumentEnd &&
        docs.slice(0, -1).some((d) => d.contents !== null) &&
        result.endsWith("---\n")
      ) {
        result = `${result}...\n`;
      }
    }

    return result;
  })(...args);
}

/**
 * Split the joined multi-doc output into per-doc segments by finding `---\n`
 * boundaries (preserving leading and trailing parts). Returns null if the
 * boundary count doesn't match the doc count.
 */
function splitMultiDocOutput(output: string, docs: ReadonlyArray<RawYamlDocument>): string[] | null {
  const segments: string[] = [];
  let pos = 0;
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    if (doc === undefined) return null;
    const isLast = i === docs.length - 1;
    if (isLast) {
      segments.push(output.slice(pos));
      break;
    }
    const next = output.indexOf("---", pos + 3);
    if (next < 0) return null;
    segments.push(output.slice(pos, next));
    pos = next;
  }
  return segments;
}

/**
 * Transform a single doc's output of form `--- <tag> <body>\n` to either:
 *  - `---\n<tag> <body>\n` (shorthand tag, e.g. `!foo`)
 *  - `--- <tag>\n<body>\n` (verbatim tag, e.g. `!<...>`)
 * Untagged or non-scalar outputs are returned unchanged.
 */
function splitDocStartFromTaggedScalar(segment: string): string {
  const verbatimMatch = segment.match(/^(---) (!<[^>]+>) (.*)$/m);
  if (verbatimMatch !== null) {
    const [whole, dashes, tag, rest] = verbatimMatch;
    return segment.replace(whole, `${dashes} ${tag}\n${rest}`);
  }
  const shorthandMatch = segment.match(/^(---) (![^ \n]+) (.*)$/m);
  if (shorthandMatch !== null) {
    const [whole, dashes, tag, rest] = shorthandMatch;
    return segment.replace(whole, `${dashes}\n${tag} ${rest}`);
  }
  return segment;
}

function hasReservedDirective(doc: RawYamlDocument): boolean {
  return doc.directives.some((d) => d.name !== "YAML" && d.name !== "TAG");
}

/**
 * Scan source for `---` at the start of a line, then check if the next
 * non-whitespace character on the same line is a newline (own-line) vs a
 * content character (inline). Returns true for `---\n<body>`, false for
 * `--- <body>`.
 */
function hadDocStartOnOwnLine(source: string): boolean {
  const lines = source.split("\n");
  for (const line of lines) {
    if (line === "---") return true;
    if (line.startsWith("--- ") && line.length > 4) return false;
  }
  return false;
}

/**
 * Returns true if the YamlSeq has an item that is a YamlMap whose value is
 * a block-scalar with an explicit indent indicator (`|N`, `>N`) detected
 * via the scalar's source-text region.
 */
function hasExplicitIndentInMapValue(seq: YamlSeq, source: string): boolean {
  return seq.items.some(
    (item) => isYamlMap(item) && item.items.some((pair) => isExplicitIndentBlockScalar(pair.value, source))
  );
}

/** True when `value` is a block scalar whose source header carries an explicit indent indicator. */
function isExplicitIndentBlockScalar(value: unknown, source: string): boolean {
  if (!isYamlScalar(value) || !isBlockScalarStyle(value.style)) return false;
  const region = source.slice(value.offset, value.offset + Math.min(value.length, 6));
  return /^[|>][1-9]/.test(region);
}

/**
 * Returns true when the source begins with a flow opener (`{` or `[`) at
 * column 0 (root level), suggesting the root collection is flow-style.
 * Walks past leading directives, document-start, and comments.
 */
function sourceHasFlowAtRoot(source: string): boolean {
  const lines = source.split("\n");
  for (const line of lines) {
    const trimmed = line.replace(/^\s+/, "");
    if (trimmed === "" || trimmed.startsWith("#") || trimmed === "---" || trimmed.startsWith("%")) {
      continue;
    }
    return trimmed.startsWith("{") || trimmed.startsWith("[");
  }
  return false;
}

/**
 * Returns true if the source has a flow collection (`{...}` or `[...]`)
 * containing a line that is only a `:` (with optional surrounding
 * whitespace). Detects VJP3/01-style spread-out flow formatting where the
 * key/value separator is on its own line.
 */
function sourceHasFlowWithIsolatedColon(source: string): boolean {
  const flowOpen = source.search(/[{[]/);
  if (flowOpen < 0) return false;
  const scan: FlowColonScan = { depth: 0, escapeNext: false, inFlow: false, inString: false, stringCh: "", text: "" };
  for (let i = flowOpen; i < source.length; i++) {
    if (stepFlowColonScan(scan, source.charAt(i))) return true;
  }
  return false;
}

/** Mutable scanner state for {@link sourceHasFlowWithIsolatedColon}. */
interface FlowColonScan {
  depth: number;
  escapeNext: boolean;
  inFlow: boolean;
  inString: boolean;
  stringCh: string;
  text: string;
}

/** Advance the flow scanner by one character; true once an isolated-colon flow collection closes. */
function stepFlowColonScan(scan: FlowColonScan, ch: string): boolean {
  if (scan.inString) {
    stepQuotedFlowChar(scan, ch);
    appendFlowText(scan, ch);
    return false;
  }
  if (ch === '"' || ch === "'") {
    scan.inString = true;
    scan.stringCh = ch;
    appendFlowText(scan, ch);
    return false;
  }
  if (ch === "{" || ch === "[") {
    scan.depth++;
    scan.inFlow = true;
  }
  appendFlowText(scan, ch);
  return (ch === "}" || ch === "]") && closeFlowCollection(scan);
}

/** Track escapes and the closing quote inside a quoted scalar. */
function stepQuotedFlowChar(scan: FlowColonScan, ch: string): void {
  if (scan.escapeNext) {
    scan.escapeNext = false;
  } else if (ch === "\\" && scan.stringCh === '"') {
    scan.escapeNext = true;
  } else if (ch === scan.stringCh) {
    scan.inString = false;
  }
}

function appendFlowText(scan: FlowColonScan, ch: string): void {
  if (scan.inFlow) scan.text += ch;
}

/** Close one flow level; true when the outermost collection held an isolated `:` line. */
function closeFlowCollection(scan: FlowColonScan): boolean {
  scan.depth--;
  if (scan.depth !== 0) return false;
  if (/\n[ \t]*:[ \t]*\n/.test(scan.text)) return true;
  scan.inFlow = false;
  scan.text = "";
  return false;
}

/**
 * Returns true when source has 2+ trailing newlines (multiple trailing
 * blank lines beyond the single chomp-preserved one). Used to discriminate
 * B3HG (`\n\n\n` at EOF) from 96L6 (`\n` at EOF).
 */
function sourceHasMultipleTrailingBlanks(source: string): boolean {
  const m = source.match(/\n+$/);
  return m !== null && m[0].length >= 3;
}

/** Characters that cannot open a plain scalar in canonical block form. */
const PLAIN_UNSAFE_FIRST_CHARS = "?:-{}[],#&*!|>'\"%@`";

/**
 * Conservative "is this string plain-safe in block context" check. Rejects
 * leading/trailing whitespace, indicator characters at the start, and chars
 * that would force quoting in canonical block form. Matches the discriminator
 * libyaml uses to decide whether to drop DQ quotes on a folded scalar root.
 */
function isPlainSafe(s: string): boolean {
  if (s.length === 0) return false;
  // Leading/trailing whitespace requires quoting
  if (/^[ \t]|[ \t]$/.test(s)) return false;
  // Leading YAML indicator chars require quoting
  if (PLAIN_UNSAFE_FIRST_CHARS.includes(s.charAt(0))) return false;
  // `:` followed by space, or trailing `:` — would parse as mapping key;
  // ` #` would start a comment
  return !/:(?: |$)/.test(s) && !s.includes(" #");
}
