// The cmark pathological suite: the linear-time guarantee.
//
// Markdown's DoS vector is quadratic emphasis and link blowup, which the
// delimiter and bracket stacks exist to defeat. Each case here is an input
// engineered to expose that blowup, paired with the output a correctly linear
// parser produces and a wall-clock budget it must produce it within.
//
// A case that exceeds its budget is an engine defect, not a budget to raise.
// Writing and keeping this suite found six:
//
//  1. The link-close deactivation walk scanned the whole bracket stack on
//     every close. Image openers are never popped, so `![[]()` repeated
//     accumulated them and the walk went quadratic — the case did not
//     terminate at all. Now O(1) via an active-opener count.
//  2. Raw inline HTML scanned to end-of-input looking for `-->` at every
//     opener. 300k unclosed `<!--` took 34s; a memo of "this sequence does
//     not occur past here" makes it 0.1s.
//  3. The code span walked run by run looking for its closing backticks,
//     which is quadratic in the number of runs. A backtick run index makes it
//     a binary search.
//  4. Image alt flattening recursed and died with a RangeError on deeply
//     nested content (see `hardening.test.ts`).
//  5. The bare link-destination scan had no paren-nesting cap, so on
//     "unclosed links B" every failed inline-link attempt scanned to the end
//     of the subject — O(n) per `]`, quadratic overall (5.2s at 30k reps,
//     4.2x per input doubling). cmark's MAX_LINK_DEST_PARENS bound
//     (`references.ts`) makes a failed attempt stop at the 33rd `(`; the
//     scaling guard below pins it linear. commonmark.js@0.31.2 has no cap
//     and shares the quadratic — the C reference is the authority here.
//  6. The "tables" case was linear but sat AT its budget (7.4s bare for 90k
//     rows): `make` on a class-typed children field re-constructs every
//     element, so the single `Table.make` re-built all 90k rows and each
//     `TableRow.make` its cells. Pointing the children fields at the real
//     one-member category unions (`MarkdownNode.ts`, see `RowContent`)
//     passes constructed instances through: 7.4s → 2.8s.
//
// Three cases nest deeper than `MAX_NESTING_DEPTH` by construction and are
// REFUSED rather than parsed — a typed guard trip in milliseconds, which is
// the hardening posture working as designed rather than a hang. They are
// named below so that a case newly falling into that branch fails the suite.

import { parseBlocks } from "@beep/markdown/internal/blockParser";
import { isGuardExceeded } from "@beep/markdown/internal/carriers";
import { ReferenceScanner } from "@beep/markdown/internal/references";
import { assert, describe, it } from "@effect/vitest";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as MutableRef from "effect/MutableRef";
import * as Str from "effect/String";
import { renderHtml } from "../support/htmlWriter.ts";
import { PATHOLOGICAL_CASES } from "../support/pathological/cases.ts";

/**
 * Cases whose input nests past the depth cap. The guard trips, so no output
 * is produced and the vendored pattern cannot match — the assertion is that
 * it trips FAST and with the right reason.
 */
const GUARD_REFUSED: ReadonlySet<string> = new Set([
  // 65000 levels of `*a **a ` nesting.
  "nested strong emph",
  // 100k nested `>`.
  "nested block quotes",
  // 1000-deep list nesting, 1000 times over.
  "deeply nested lists",
]);

// --- the budgets are relative, and they have to be --------------------------
//
// The vendored budgets are wall clock, so they measure the machine and the
// instrumentation as much as the engine. Under this repo's default v8
// coverage the same parse costs about THREE times what it costs
// uninstrumented — measured, not guessed: the calibration input below takes
// 93ms clean and ~290ms instrumented, and the heaviest case ("tables") 2.8s
// clean against 8.7s. The factor is path-dependent — materialization-heavy
// parses (most of this suite's cost) inflate ~3x while tight engine loops
// inflate ~9x (and the pre-cap destination scan measured 18x) — which is
// what the calibration exists to absorb, and why the linearity guard below
// counts scanner work independently of these termination budgets.
//
// Asserting raw milliseconds would therefore mean "this suite passes only
// without coverage", which is a trap: it would go red in CI for a reason that
// has nothing to do with the parser. Asserting nothing would give up the
// linear-time guarantee entirely.
//
// So the suite calibrates. It times a small input through the same code path
// as the heaviest case, divides by what that costs on a clean run, and scales
// every budget by the result. A real algorithmic regression still fails —
// quadratic blowup outruns any constant factor — while instrumentation and
// slow hardware scale the calibration and the case together.

/**
 * A small input through the gfm table path — the heaviest machinery now that
 * the destination scan is capped: the suite's dominant cost is node
 * materialization, and this input is the "tables" case at 1/30th scale, so
 * the calibration and the heaviest case inflate together under
 * instrumentation. (The previous calibration input, `Str.repeat(3000)("[a](b")`,
 * measured the then-quadratic destination scan; with the paren cap it costs
 * ~3ms and calibrates nothing.)
 */
const CALIBRATION_INPUT = Str.repeat(1000)("aaa\rbbb\n-\u000b\n");

/** What {@link CALIBRATION_INPUT} costs uninstrumented. */
const CALIBRATION_BASELINE_MS = 93;

const speedFactor = ((): number => {
  // One warm-up pass so the measurement is not dominated by first-call
  // compilation of the parse path.
  parseBlocks(CALIBRATION_INPUT, { dialect: "gfm" });
  const started = performance.now();
  parseBlocks(CALIBRATION_INPUT, { dialect: "gfm" });
  const elapsed = performance.now() - started;
  return Math.min(Math.max(elapsed / CALIBRATION_BASELINE_MS, 1), 40);
})();

/** Scoped wrapper of the scanner's own step; restored even when a test fails. */
class DestinationWork extends Context.Service<
  DestinationWork,
  { readonly workOf: (parse: () => unknown) => Effect.Effect<number> }
>()("@beep/markdown/test/e2e/pathological/DestinationWork") {
  static readonly layer = Layer.effect(
    DestinationWork,
    Effect.acquireRelease(
      Effect.sync(() => {
        const tally = MutableRef.make(0);
        const step = ReferenceScanner.prototype.skipDestinationRun;
        ReferenceScanner.prototype.skipDestinationRun = function () {
          const start = this.pos;
          const char = step.call(this);
          MutableRef.update(tally, (work) => work + this.pos - start + 1);
          return char;
        };
        return {
          step,
          service: DestinationWork.of({
            workOf: Effect.fn("DestinationWork.workOf")((parse: () => unknown) =>
              Effect.sync(() => {
                MutableRef.set(tally, 0);
                parse();
                return MutableRef.get(tally);
              })
            ),
          }),
        };
      }),
      ({ step }) =>
        Effect.sync(() => {
          ReferenceScanner.prototype.skipDestinationRun = step;
        })
    ).pipe(Effect.map(({ service }) => service))
  );
}

/** Reproduce the removed uncapped scan: each failed destination walks its whole tail. */
const uncappedDestinations = (reps: number): void => {
  const scanner = new ReferenceScanner(Str.repeat(reps)("[a](b"));
  for (let attempt = 0; attempt < reps; attempt += 1) {
    scanner.pos = attempt * 5 + 4;
    while (scanner.skipDestinationRun() !== "") scanner.pos += 1;
  }
};

describe("pathological inputs", () => {
  it("carries the whole vendored suite", () => {
    // The silently-empty-walk guard: an import that resolved to nothing
    // would make every test below vacuous.
    assert.isAtLeast(PATHOLOGICAL_CASES.length, 20);
  });

  for (const testCase of PATHOLOGICAL_CASES) {
    it(
      testCase.name,
      () => {
        const started = performance.now();
        let caught: unknown;
        let html = "";
        try {
          // A case's dialect defaults to the commonmark substrate;
          // upstream's GFM-extension cases parse and render under gfm.
          html =
            testCase.dialect === "gfm"
              ? renderHtml(parseBlocks(testCase.input, { dialect: "gfm" }).root, { gfm: true })
              : renderHtml(parseBlocks(testCase.input).root);
        } catch (error) {
          caught = error;
        }
        const elapsed = performance.now() - started;

        // Termination first: a hang is the failure this suite exists to
        // catch, and it is a failure whichever branch the case takes.
        const budget = testCase.timeoutMs * speedFactor;
        assert.isBelow(
          elapsed,
          budget,
          `${testCase.name} took ${elapsed.toFixed(0)}ms, over its ${testCase.timeoutMs}ms budget ` +
            `scaled by ${speedFactor.toFixed(1)}x to ${budget.toFixed(0)}ms`
        );

        if (GUARD_REFUSED.has(testCase.name)) {
          assert.isTrue(
            isGuardExceeded(caught),
            `${testCase.name} is listed as guard-refused but did not trip the guard`
          );
          return;
        }

        assert.isUndefined(caught, `${testCase.name} threw: ${String(caught)}`);
        assert.match(html, testCase.expectedPattern);
      },
      testCase.timeoutMs * 40 + 5000
    );
  }

  it.layer(DestinationWork.layer)((it) => {
    it.effect("unclosed links B scales linearly", () =>
      Effect.gen(function* () {
        const { workOf } = yield* DestinationWork;
        const workAt = (reps: number) => workOf(() => parseBlocks(Str.repeat(reps)("[a](b")));
        // The final 33 attempts have shorter tails; each additional repetition
        // after that costs exactly 33 scans of four ordinary units plus a stop.
        const small = yield* workAt(7500);
        const medium = yield* workAt(15000);
        const large = yield* workAt(30000);
        assert.isAbove(small, 0, "the real parser must enter the metered seam");
        assert.strictEqual(medium - small, 7500 * 33 * 5);
        assert.strictEqual(large - medium, 15000 * 33 * 5);
      })
    );

    it.effect("the same counter detects uncapped quadratic destination scans", () =>
      Effect.gen(function* () {
        const { workOf } = yield* DestinationWork;
        const small = yield* workOf(() => uncappedDestinations(40));
        const medium = yield* workOf(() => uncappedDestinations(80));
        const large = yield* workOf(() => uncappedDestinations(160));
        assert.isAbove(small, 0);
        assert.isAbove(large - medium, 2 * (medium - small));
      })
    );
  });
});
