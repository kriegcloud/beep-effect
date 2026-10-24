import {
  ExpectationRewrite,
  FINAL_CHECK_RECEIPT_DIR,
  FinalCheckGate,
  FinalCheckReceipt,
  FinalCheckStepResult,
  finalCheckRefusal,
  findExpectationRewrites,
  parseFinalCheckGates,
  parseFinalCheckSkips,
  planFinalCheckSteps,
  readFinalCheckReceipt,
  rewrittenTestFiles,
  verifyExpectationRewrites,
} from "@beep/repo-cli/test/Yeet";
import { NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { assertNone, assertSome } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";

const HEAD = "a".repeat(40);
const BASE = "b".repeat(40);

// #2215 rewrote this expectation to match #2212's over-escaped `@`
// (ba0efdf11c, packages/tooling/tool/cli/test/yeet.test.ts:2375).
const MASKING_DIFF = [
  "diff --git a/packages/tooling/tool/cli/test/yeet.test.ts b/packages/tooling/tool/cli/test/yeet.test.ts",
  "index 5e0320ec5f..651379b01f 100644",
  "--- a/packages/tooling/tool/cli/test/yeet.test.ts",
  "+++ b/packages/tooling/tool/cli/test/yeet.test.ts",
  "@@ -2375 +2375 @@ printf '%s\\\\n' '{\"number\":874}'",
  '-      expect(markdown).toContain("# Yeet Quality Packet: @beep/repo\\\\-cli");',
  '+      expect(markdown).toContain("# Yeet Quality Packet: \\\\@beep/repo\\\\-cli");',
].join("\n");

const receiptOf = (overrides: Partial<ConstructorParameters<typeof FinalCheckReceipt>[0]> = {}) =>
  FinalCheckReceipt.make({
    schemaVersion: "yeet-final-check/v1",
    headSha: HEAD,
    mergeBase: BASE,
    base: "origin/main",
    complete: true,
    verdict: "pass",
    startedAt: "2026-10-24T00:00:00.000Z",
    finishedAt: "2026-10-24T00:10:00.000Z",
    steps: [],
    expectationRewrites: [],
    ...overrides,
  });

const failedStep = (gate: FinalCheckGate) =>
  FinalCheckStepResult.make({
    gate,
    label: `final-check:${gate}`,
    hostedContext: "Heavy / Check",
    command: "bun run beep ci lane check",
    status: "failed",
    durationMs: 10,
    reason: "exit 2",
  });

describe("findExpectationRewrites", () => {
  it("flags #2215's rewritten expectation with its new line number", () => {
    const rewrites = findExpectationRewrites(MASKING_DIFF);
    expect(rewrites).toHaveLength(1);
    expect(rewrites[0]).toMatchObject({ testFile: "packages/tooling/tool/cli/test/yeet.test.ts", line: 2375 });
    expect(rewrites[0]?.removed).toContain("@beep/repo");
    expect(rewrites[0]?.added).toContain("\\\\@beep/repo");
  });

  it("ignores newly added assertions, non-assertion edits and non-test files", () => {
    const diff = [
      "diff --git a/pkg/test/a.test.ts b/pkg/test/a.test.ts",
      "+++ b/pkg/test/a.test.ts",
      "@@ -0,0 +5,2 @@",
      '+    expect(value).toBe("new")',
      "+    assertTrue(flag)",
      "@@ -9 +11 @@",
      "-    const fixture = 1",
      "+    const fixture = 2",
      "diff --git a/pkg/src/a.ts b/pkg/src/a.ts",
      "+++ b/pkg/src/a.ts",
      "@@ -1 +1 @@",
      '-expect("a").toBe("a")',
      '+expect("b").toBe("b")',
    ].join("\n");
    expect(findExpectationRewrites(diff)).toEqual([]);
  });

  it("pairs each added assertion with a removed one across hunks and files", () => {
    const diff = [
      "diff --git a/p/test/a.test.ts b/p/test/a.test.ts",
      "--- a/p/test/a.test.ts",
      "+++ b/p/test/a.test.ts",
      "@@ -3,2 +3,2 @@",
      "-  assert.strictEqual(x, 1)",
      "-  expect(y).toEqual([1])",
      "+  assert.strictEqual(x, 2)",
      "+  expect(y).toEqual([2])",
      "diff --git a/p/test/b.spec.tsx b/p/test/b.spec.tsx",
      "+++ b/p/test/b.spec.tsx",
      "@@ -7 +7,2 @@",
      "-  deepStrictEqual(a, b)",
      "+  deepStrictEqual(a, c)",
      "+  deepStrictEqual(a, d)",
    ].join("\n");
    const rewrites = findExpectationRewrites(diff);
    expect(A.map(rewrites, (rewrite) => [rewrite.testFile, rewrite.line])).toEqual([
      ["p/test/a.test.ts", 3],
      ["p/test/a.test.ts", 4],
      ["p/test/b.spec.tsx", 7],
      ["p/test/b.spec.tsx", 8],
    ]);
    expect(rewrites[3]?.removed).toBe("deepStrictEqual(a, b)");
    expect(rewrittenTestFiles(rewrites)).toEqual([
      ["p/test/a.test.ts", 2],
      ["p/test/b.spec.tsx", 2],
    ]);
  });

  it("maps an edited snapshot to its test file and skips added-only snapshots", () => {
    const diff = [
      "diff --git a/p/test/__snapshots__/render.test.ts.snap b/p/test/__snapshots__/render.test.ts.snap",
      "+++ b/p/test/__snapshots__/render.test.ts.snap",
      "@@ -4 +4 @@",
      '-exports[`render 1`] = `"old"`;',
      '+exports[`render 1`] = `"new"`;',
      "@@ -0,0 +9 @@",
      '+exports[`render 2`] = `"added"`;',
    ].join("\n");
    expect(findExpectationRewrites(diff)).toEqual([
      ExpectationRewrite.make({
        testFile: "p/test/render.test.ts",
        line: 4,
        removed: 'exports[`render 1`] = `"old"`;',
        added: 'exports[`render 1`] = `"new"`;',
      }),
    ]);
  });

  it("treats a deleted test file as no rewrite", () => {
    const diff = [
      "diff --git a/p/test/gone.test.ts b/p/test/gone.test.ts",
      "--- a/p/test/gone.test.ts",
      "+++ /dev/null",
      "@@ -1 +0,0 @@",
      "-  expect(a).toBe(1)",
    ].join("\n");
    expect(findExpectationRewrites(diff)).toEqual([]);
  });
});

describe("planFinalCheckSteps", () => {
  it("replays every subprocess gate through the hosted lane argv scoped to the merge base", () => {
    const steps = planFinalCheckSteps("/repo", BASE);
    const gates = A.dedupe(A.map(steps, (step) => step.gate));
    expect(gates).toEqual(A.filter(FinalCheckGate.literals, (gate) => gate !== "expectation-rewrite"));
    const argv = (label: string) => O.getOrThrow(A.findFirst(steps, (step) => step.step.label === label)).step.args;
    expect(argv("final-check:check")).toEqual([
      "run",
      "beep",
      "ci",
      "lane",
      "check",
      "--affected",
      "--base",
      BASE,
      "--summarize",
    ]);
    expect(argv("final-check:effect-diagnostics")).toContain("effect-diagnostics");
    expect(argv("final-check:docgen")).toEqual([
      "run",
      "beep",
      "ci",
      "lane",
      "docgen",
      "--mode",
      "auto",
      "--base",
      BASE,
    ]);
    expect(argv("final-check:fallow")).toEqual([
      "run",
      "beep",
      "ci",
      "lane",
      "fallow",
      "--base",
      BASE,
      "--validate-envelopes",
    ]);
    expect(argv("final-check:repo-sanity")).toEqual(["run", "beep", "ci", "lane", "repo-sanity", "--changeset-status"]);
    expect(argv("final-check:lint-policy:laws")).toEqual(["run", "beep", "lint", "policy", "--base", BASE]);
    expect(argv("final-check:lint-policy:docs")).toEqual([
      "oxlint",
      ".",
      "--config",
      ".oxlintrc.docs.json",
      "--max-warnings=0",
    ]);
    expect(argv("final-check:lint-policy:deprecated-apis")).toEqual([
      "run",
      "beep",
      "lint",
      "deprecated-apis",
      "--full",
    ]);
    const coverage = O.getOrThrow(A.findFirst(steps, (step) => step.gate === "coverage")).step;
    expect(coverage.args).toEqual(["run", "coverage", "--affected"]);
    expect(coverage.env).toEqual({ TURBO_SCM_BASE: BASE });
    expect(A.every(steps, (step) => step.step.cwd === "/repo")).toBe(true);
    expect(planFinalCheckSteps(BASE)("/repo")).toEqual(steps);
  });
});

describe("final-check flag parsing", () => {
  it.effect("selects every gate by default and a comma-separated subset in run order", () =>
    Effect.gen(function* () {
      expect(yield* parseFinalCheckGates([])).toEqual(FinalCheckGate.literals);
      expect(yield* parseFinalCheckGates(["docgen,check", " lint "])).toEqual(["lint", "check", "docgen"]);
    })
  );

  it.effect("refuses an unknown gate", () =>
    Effect.gen(function* () {
      const error = yield* parseFinalCheckGates(["check,heavy"]).pipe(Effect.flip);
      expect(error.message).toContain("Unknown final-check gate(s): heavy");
    })
  );

  it.effect("parses skips and refuses one without a reason or with an unknown gate", () =>
    Effect.gen(function* () {
      const skips = yield* parseFinalCheckSkips(["coverage = admission waited 10 minutes"]);
      expect(skips).toMatchObject([{ gate: "coverage", reason: "admission waited 10 minutes" }]);
      expect((yield* parseFinalCheckSkips(["coverage"]).pipe(Effect.flip)).message).toContain("--skip must be");
      expect((yield* parseFinalCheckSkips(["coverage="]).pipe(Effect.flip)).message).toContain("--skip must be");
      expect((yield* parseFinalCheckSkips(["nope=x"]).pipe(Effect.flip)).message).toContain("Valid gates");
    })
  );
});

describe("finalCheckRefusal", () => {
  it("admits only a complete passing receipt for the exact head", () => {
    assertNone(finalCheckRefusal(O.some(receiptOf()), HEAD));
    assertNone(finalCheckRefusal(HEAD)(O.some(receiptOf())));
    expect(O.getOrThrow(finalCheckRefusal(O.none(), HEAD))).toContain("no final-check receipt for head aaaaaaaaaaaa");
    expect(O.getOrThrow(finalCheckRefusal(O.some(receiptOf({ headSha: BASE })), HEAD))).toContain(
      "is for bbbbbbbbbbbb, not head aaaaaaaaaaaa"
    );
    expect(O.getOrThrow(finalCheckRefusal(O.some(receiptOf({ complete: false })), HEAD))).toContain("--gates subset");
    expect(
      O.getOrThrow(
        finalCheckRefusal(
          O.some(
            receiptOf({ verdict: "fail", steps: [failedStep("check"), failedStep("check"), failedStep("docgen")] })
          ),
          HEAD
        )
      )
    ).toContain("final-check failed on check, docgen");
  });
});

it.layer(NodeServices.layer)("final-check receipts on disk", (it) => {
  it.effect("reads a written receipt and treats an absent or malformed one as none", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const root = yield* fs.makeTempDirectoryScoped({ prefix: "yeet-final-check-" });
      assertNone(yield* readFinalCheckReceipt(root, HEAD));
      const dir = path.join(root, FINAL_CHECK_RECEIPT_DIR);
      yield* fs.makeDirectory(dir, { recursive: true });
      const encoded = yield* S.encodeUnknownEffect(S.fromJsonString(FinalCheckReceipt))(receiptOf());
      yield* fs.writeFileString(path.join(dir, `${HEAD}.json`), encoded);
      assertSome(yield* readFinalCheckReceipt(root, HEAD), receiptOf());
      yield* fs.writeFileString(path.join(dir, `${BASE}.json`), "{not json");
      assertNone(yield* readFinalCheckReceipt(root, BASE));
    })
  );

  it.effect("creates no merge-base worktree when nothing was rewritten", () =>
    Effect.gen(function* () {
      expect(yield* verifyExpectationRewrites("/nonexistent-repo", BASE, [])).toEqual([]);
    })
  );
});
