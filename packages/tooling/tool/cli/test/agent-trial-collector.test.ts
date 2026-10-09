import {
  collectNativeGateOutcome,
  collectPackageVerifyOutcome,
  collectVitestOutcome,
  TrialEvaluatorCheck,
  trialCheckContractDigest,
  trialYeetVerdictLocation,
} from "@beep/repo-cli/test/AgentEffectiveness";
import { Sha256Hex } from "@beep/schema/Sha256";
import { expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

const report = (changes: Record<string, unknown> = {}) =>
  JSON.stringify({
    numTotalTests: 2,
    numPassedTests: 2,
    numFailedTests: 0,
    numPendingTests: 0,
    numTotalTestSuites: 7,
    success: true,
    testResults: [
      {
        status: "passed",
        assertionResults: [
          { fullName: "a", status: "passed" },
          { fullName: "b", status: "passed" },
        ],
      },
    ],
    ...changes,
  });
it.effect("requires the frozen assertion inventory rather than describe-suite counts", () =>
  Effect.gen(function* () {
    expect((yield* collectVitestOutcome("semantic", report(), 0, ["a", "b"])).passed).toBe(true);
    for (const raw of [
      report({ numTotalTests: 3 }),
      report({ unhandledErrors: [{}] }),
      report({ numPendingTests: 1 }),
      "{}",
    ])
      expect((yield* collectVitestOutcome("semantic", raw, 0, ["a", "b"])).classification).toBe("collection-failure");
    expect((yield* collectVitestOutcome("semantic", report(), 0, ["a", "c"])).passed).toBe(false);
    expect((yield* collectVitestOutcome("semantic", report(), 1, ["a", "b"])).passed).toBe(false);
  })
);
it.effect("retains semantic failures and detects empty failed file collection", () =>
  Effect.gen(function* () {
    const failed = report({
      numPassedTests: 1,
      numFailedTests: 1,
      success: false,
      testResults: [
        {
          status: "failed",
          assertionResults: [
            { fullName: "a", status: "passed" },
            { fullName: "b", status: "failed" },
          ],
        },
      ],
    });
    expect((yield* collectVitestOutcome("semantic", failed, 1, ["a", "b"])).classification).toBe("semantic-failure");
    expect(
      (yield* collectVitestOutcome(
        "semantic",
        report({ testResults: [{ status: "failed", message: "missing import", assertionResults: [] }] }),
        1,
        ["a", "b"]
      )).collectionFailures
    ).toBeGreaterThan(0);
  })
);
it.effect("requires default package audit and docgen exactly once", () =>
  Effect.gen(function* () {
    const raw = "pkg-verify @beep/foo (packages/foo)\n  ok audit 12.3s   ok docgen 1.2s\n";
    expect((yield* collectPackageVerifyOutcome("package", raw, 0, "@beep/foo")).passed).toBe(true);
    for (const invalid of [
      raw.replace(" (", " [quick] ("),
      raw.replace("ok docgen", "skip docgen"),
      raw + raw,
      raw.replace("docgen", "check"),
    ])
      expect((yield* collectPackageVerifyOutcome("package", invalid, 0, "@beep/foo")).passed).toBe(false);
    expect((yield* collectPackageVerifyOutcome("package", raw, 1, "@beep/foo")).passed).toBe(false);
  })
);
it.effect("keeps missing exports in the denominator as incomplete implementation", () =>
  Effect.gen(function* () {
    const raw = JSON.stringify({
      schemaVersion: "public-export-gate/v1",
      collected: 4,
      passed: 3,
      failed: 1,
      collectionFailures: 0,
      outcome: "implementation_incomplete",
    });
    const result = yield* collectNativeGateOutcome("exports", raw, 1, "public-export-gate/v1");
    expect(result.classification).toBe("implementation-incomplete");
    expect(result.collected).toBe(4);
    expect(result.passed).toBe(false);
  })
);

it.effect("binds timeout, output overlays, environment and exact cases in the frozen contract", () =>
  Effect.gen(function* () {
    const zero = Sha256Hex.make("0".repeat(64));
    const check = TrialEvaluatorCheck.make({
      id: "semantic",
      kind: "vitest",
      commandTemplate: ["/runtime/bin/node", "SEALED/check.mjs"],
      environmentTemplate: { B: "two", A: "one" },
      input: { root: "/private/sealed", digest: zero, files: {}, symlinks: {} },
      expectedCases: ["a"],
      expectedPackage: O.none(),
      reportRelativePath: O.some("report.json"),
      writableCacheTargets: ["/workspace/node_modules/.vite"],
      compilerOverlay: O.none(),
      timeoutMs: 7200000,
    });
    const frozen = yield* trialCheckContractDigest(check);
    expect(
      yield* trialCheckContractDigest(
        TrialEvaluatorCheck.make({ ...check, environmentTemplate: { A: "one", B: "two" } })
      )
    ).toBe(frozen);
    for (const patch of [
      { timeoutMs: 1 },
      { writableCacheTargets: ["/workspace/.beep"] },
      { expectedCases: ["b"] },
      { environmentTemplate: { A: "changed" } },
    ]) {
      expect(yield* trialCheckContractDigest(TrialEvaluatorCheck.make({ ...check, ...patch }))).not.toBe(frozen);
    }
  })
);

it("requires one canonical native Yeet verdict location", () => {
  const line = "[yeet] verdict written to /workspace/.beep/yeet/runs/fixture_01/verdict.json";
  expect(O.getOrNull(trialYeetVerdictLocation(line))).toBe("/workspace/.beep/yeet/runs/fixture_01/verdict.json");
  for (const invalid of [
    "",
    `${line}\n${line}`,
    line.replace("fixture_01", "../escape"),
    line.replace("/workspace", "/private"),
    line.replace("fixture_01", "x//y"),
  ])
    expect(O.isNone(trialYeetVerdictLocation(invalid))).toBe(true);
});
