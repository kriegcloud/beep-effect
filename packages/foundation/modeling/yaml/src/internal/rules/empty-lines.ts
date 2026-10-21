// empty-lines: caps runs of consecutive blank lines — in the body
// (`max`), at document start (`maxStart`) and at document end (`maxEnd`).
// Blank lines inside scalar content are the value's business and are
// skipped. The fix deletes the excess lines surgically.

import { $YamlId } from "@beep/identity/packages";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { YamlEdit } from "../../YamlEdit.ts";
import { StyleFloor, YamlLintDiagnostic, YamlLintSeverity, YamlRule } from "../../YamlLintRule.ts";
import { insideScalarSpan, nonNegativeIntegerOption, walkScalars } from "./util.ts";
import type { LintContext, LintLine } from "../../YamlLintRule.ts";
import type { YamlScalar } from "../../YamlNode.ts";

const $I = $YamlId.create("internal/rules/empty-lines");

/**
 * Limit consecutive blank lines in the body and at document boundaries.
 *
 * **Details**
 *
 * Options for `empty-lines`: `max` consecutive blank lines in the body
 * (default 2), `maxStart` at the document start and `maxEnd` at the end
 * (both default 0).
 *
 * **Example** (Decode empty-lines options)
 *
 * ```ts
 * import * as S from "effect/Schema";
 * import { emptyLinesOptions } from "@beep/yaml/internal/rules/empty-lines";
 *
 * const options = S.decodeUnknownSync(emptyLinesOptions)({ max: 1, maxStart: 0, maxEnd: 0 });
 * console.log(options.max) // 1
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class emptyLinesOptions extends S.Opaque<emptyLinesOptions, { readonly brand: unique symbol }>()(
  S.Struct({
    severity: S.optionalKey(YamlLintSeverity).pipe(
      $I.annoteKey("emptyLinesOptions.severity", {
        description: "Reporting level for excessive blank-line findings, defaulting to `error`",
      })
    ),
    max: S.optionalKey(nonNegativeIntegerOption).pipe(
      $I.annoteKey("emptyLinesOptions.max", {
        description: "Maximum consecutive blank lines in the document body outside scalar content, defaulting to 2",
      })
    ),
    maxStart: S.optionalKey(nonNegativeIntegerOption).pipe(
      $I.annoteKey("emptyLinesOptions.maxStart", {
        description: "Maximum consecutive blank lines at the start of the input, defaulting to 0",
      })
    ),
    maxEnd: S.optionalKey(nonNegativeIntegerOption).pipe(
      $I.annoteKey("emptyLinesOptions.maxEnd", {
        description: "Maximum consecutive blank lines at the end of the input outside scalar content, defaulting to 0",
      })
    ),
  }).pipe(
    $I.annoteSchema("emptyLinesOptions", {
      description:
        "Options for `empty-lines`: `max` consecutive blank lines in the body (default 2), `maxStart` at the document start and `maxEnd` at the end (both default 0).",
    })
  )
) {}

/** Build the layout-line predicate once, protecting composed scalar content too. */
const layoutBlankLine = (ctx: LintContext): ((line: LintLine) => boolean) => {
  const spans: Array<YamlScalar> = [];
  walkScalars(ctx.document.contents, "root", (scalar) => {
    if (scalar.sourceMultiline === true) spans.push(scalar);
  });
  return (line) =>
    line.text === "" &&
    !insideScalarSpan(ctx.tokens, line.offset) &&
    !A.some(spans, (scalar) => scalar.offset < line.offset && line.offset < scalar.offset + scalar.length);
};

/** A maximal run `[start, end)` of layout-blank line indices. */
type BlankRun = { readonly start: number; readonly end: number };

/** The configured blank-run caps for the body, start and end of the input. */
type BlankCaps = { readonly max: number; readonly maxStart: number; readonly maxEnd: number };

const readBlankCaps = (options: unknown): BlankCaps => ({
  max: P.hasProperty(options, "max") && S.is(emptyLinesOptions.fields.max.schema)(options.max) ? options.max : 2,
  maxStart:
    P.hasProperty(options, "maxStart") && S.is(emptyLinesOptions.fields.maxStart.schema)(options.maxStart)
      ? options.maxStart
      : 0,
  maxEnd:
    P.hasProperty(options, "maxEnd") && S.is(emptyLinesOptions.fields.maxEnd.schema)(options.maxEnd)
      ? options.maxEnd
      : 0,
});

/** Every maximal run of layout-blank lines, in source order. */
const blankRuns = (ctx: LintContext): ReadonlyArray<BlankRun> => {
  const lines = ctx.lines;
  const isLayoutBlank = layoutBlankLine(ctx);
  const runs: Array<BlankRun> = [];
  let i = 0;
  while (i < lines.length) {
    if (!isLayoutBlank(A.getUnsafe(lines, i))) {
      i++;
      continue;
    }
    let end = i;
    while (end < lines.length && isLayoutBlank(A.getUnsafe(lines, end))) end++;
    runs.push({ start: i, end });
    i = end;
  }
  return runs;
};

/** True when the run touches neither the start nor the end of the input. */
const isBodyRun = (ctx: LintContext, run: BlankRun): boolean => run.start !== 0 && run.end !== ctx.lines.length;

/** The cap that applies to a run by where it sits. */
const allowedForRun = (ctx: LintContext, run: BlankRun, caps: BlankCaps): number => {
  if (run.start === 0) return caps.maxStart;
  return run.end === ctx.lines.length ? caps.maxEnd : caps.max;
};

/**
 * Report a run beyond its cap. Line text excludes the terminator whole (a
 * CRLF blank line is `""`), but fix spans are SOURCE coordinates: delete
 * from the first excess blank line's start through the last blank line's
 * terminator — derived from the NEXT line's offset (or the text end) so a
 * CRLF terminator goes whole.
 */
const runFinding = (ctx: LintContext, run: BlankRun, allowed: number): YamlLintDiagnostic | undefined => {
  const runLength = run.end - run.start;
  if (runLength <= allowed) return undefined;
  // The excess index is inside the scanned run: allowed < runLength.
  const firstExcess = A.getUnsafe(ctx.lines, run.start + allowed);
  const nextLine = ctx.lines[run.end];
  const deleteEnd = nextLine !== undefined ? nextLine.offset : ctx.text.length;
  return YamlLintDiagnostic.make({
    rule: "empty-lines",
    severity: "error",
    message: `Too many consecutive blank lines (${runLength} > ${allowed})`,
    offset: firstExcess.offset,
    length: deleteEnd - firstExcess.offset,
    line: firstExcess.number,
    character: 0,
    fix: YamlEdit.make({
      offset: firstExcess.offset,
      length: deleteEnd - firstExcess.offset,
      content: "",
    }),
  });
};

/**
 * Report runs of blank lines beyond the configured caps, with a deleting fix.
 *
 * **Details**
 *
 * Blank lines inside scalar content are skipped. Deletions cover whole line
 * terminators, including CRLF. Inference records the longest body run as a
 * floor; it does not infer the caps.
 *
 * **Example** (Count an excessive blank-line run)
 *
 * ```ts
 * import { emptyLines } from "@beep/yaml/internal/rules/empty-lines";
 * import { YamlLint, YamlLintConfig } from "@beep/yaml/YamlLint";
 *
 * const config = YamlLintConfig.make({
 *   rules: { "empty-lines": { max: 1 } },
 * });
 * const diagnostics = YamlLint.run("name: Ada\n\n\n\nnext: item\n", [emptyLines], config);
 * console.log(diagnostics.length) // 1
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const emptyLines = YamlRule.make({
  id: "empty-lines",
  check: dual(2, (ctx: LintContext, options: unknown): Iterable<YamlLintDiagnostic> => {
    const caps = readBlankCaps(options);
    const out: Array<YamlLintDiagnostic> = [];
    for (const run of blankRuns(ctx)) {
      const finding = runFinding(ctx, run, allowedForRun(ctx, run, caps));
      if (finding !== undefined) out.push(finding);
    }
    return out;
  }),
  // Inference: the max blank run is inferable only as a FLOOR — a
  // corpus whose longest body run is N proves `max` must be at least N to
  // accept it, not that the author would forbid N+1. The floor rides in
  // the evidence; the caps stay default-driven under both resolvers. Same
  // segmentation as the check: body runs only (start/end runs are the
  // `maxStart`/`maxEnd` caps' business), scalar content skipped.
  infer: (ctx) => {
    let longest = 0;
    for (const run of blankRuns(ctx)) {
      if (isBodyRun(ctx, run)) longest = Math.max(longest, run.end - run.start);
    }
    return longest > 0 ? [StyleFloor.make({ dimension: "max", value: longest })] : [];
  },
});
