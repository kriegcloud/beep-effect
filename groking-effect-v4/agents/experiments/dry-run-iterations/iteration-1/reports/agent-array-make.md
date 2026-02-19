# Dry-Run Feedback Report

## Metadata
- Agent ID: `agent-array-make`
- Iteration: `1`
- Export file: `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/make.const.ts`
- Export kind: `const`
- Prompt bundle: `shared/base-system.md`, `kinds/value-like.md`, `shared/dry-run-overlay.md`
- Config bundle: `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/configs/dry-run.worker.jsonc`

## What Worked
- The target export already follows the value-like scaffold cleanly: runtime inspection + callable probe + Bun main entrypoint.
- Runtime inspection output is informative for this export (`typeof function`, preview shows `(...elements) => elements`).
- Dry-run constraints were unambiguous and easy to follow (single-file ownership, report-only output).
- Smoke run succeeded with no runtime failures using `bun ./src/effect/Array/exports/make.const.ts`.

## What Didn't
- The generic callable probe invokes `Array.make` with zero arguments and reports success with `[]`, which is pedagogically misaligned with the summary/JSDoc intent of “one or more elements.”
- The current kind prompt does not tell the agent how to adapt probes for parameterized APIs, so the default probe can produce technically valid but misleading demos.
- Config requires blocker analysis but has no explicit structure for capturing “semantic mismatch” findings versus hard execution blockers.

## Proposed Changes
### Documentation
- Add a short guideline: for exports with required/domain-significant parameters, behavior probes should use a representative invocation from JSDoc (or a deterministic fixture), not only zero-arg probing.
- Add a verification checklist item requiring alignment between `Overview`, `Source JSDoc Example`, and observed probe output.

### Prompt
- Extend `kinds/value-like.md` with an invocation policy: use zero-arg probe only when `function.length === 0` or semantics are explicitly optional.
- Require one “documented behavior” example for callable exports when source docs include a concrete invocation.

### Agent Config
- Add a dry-run check flag such as `require_summary_behavior_alignment: true` to force reporting when runtime probe output contradicts the stated summary.
- Add optional report field config for `semantic_risks` to separate correctness gaps from hard blockers.

## Proposed Patch Sketch (Not Applied)
```diff
diff --git a/src/effect/Array/exports/make.const.ts b/src/effect/Array/exports/make.const.ts
--- a/src/effect/Array/exports/make.const.ts
+++ b/src/effect/Array/exports/make.const.ts
@@
 import {
   createPlaygroundProgram,
-  inspectNamedExport,
-  probeNamedExportFunction
+  inspectNamedExport
 } from "@beep/groking-effect-v4/runtime/Playground";
@@
-const exampleCallableProbe = Effect.gen(function* () {
-  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
-  yield* probeNamedExportFunction({ moduleRecord, exportName });
+const exampleDocumentedInvocation = Effect.gen(function* () {
+  yield* Console.log("Invoke Array.make with documented sample input.");
+
+  const target = moduleRecord[exportName];
+  if (typeof target !== "function") {
+    yield* Console.log("ℹ️ Target is not callable; skipped documented invocation.");
+    return;
+  }
+
+  const make = target as (...elements: ReadonlyArray<number>) => ReadonlyArray<number>;
+  const result = make(1, 2, 3);
+  yield* Console.log(`✅ Array.make(1, 2, 3) => ${JSON.stringify(result)}`);
+  yield* Console.log(`📏 Result length: ${result.length}`);
 });
@@
     {
-      title: "Callable Value Probe",
-      description: "Attempt a zero-arg invocation when the value is function-like.",
-      run: exampleCallableProbe
+      title: "Documented Invocation",
+      description: "Run the source example input and inspect the produced array.",
+      run: exampleDocumentedInvocation
     }
   ]
 });
```

## Estimated Real Run Effort
- Estimated duration: `15-25 minutes` (including one Bun smoke run and log review).
- Confidence: `0.90`
- Primary risks: Overfitting invocation logic for this export and not generalizing safely to other callable const exports with currying/overloads.
