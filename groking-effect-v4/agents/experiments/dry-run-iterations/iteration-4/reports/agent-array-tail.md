# Dry-Run Feedback Report

## Metadata
- Agent ID: agent-array-tail
- Iteration: 4
- Export file: /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/tail.function.ts
- Export kind: function
- Prompt bundle:
  - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/prompts/shared/base-system.md
  - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/prompts/kinds/function-like.md
  - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/prompts/shared/dry-run-overlay.md
- Config bundle:
  - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/configs/dry-run.worker.jsonc

## What Worked
- Dry-run constraints were respected: target export was not modified and the deliverable is report-only.
- Runtime execution succeeds with Bun (`bun src/effect/Array/exports/tail.function.ts`), and the program completes.
- Discovery example is useful: runtime type is `function` and preview confirms `tail(self)` behavior.
- Summary/JSDoc intent is accurate and easy to test. Direct checks confirm:
  - `Array.tail.length === 1`
  - `Array.tail([1, 2, 3, 4])` returns `[2, 3, 4]`
  - `Array.tail([])` returns `undefined`

## What Didn't
- Example 2 currently uses a zero-arg probe (`probeNamedExportFunction`), which fails with `TypeError` for `tail`.
- That invocation style is mismatched for a required-arity function and conflicts with dry-run config intent (`disallow_zero_arg_probe_when_required_arity_detected`).
- The invocation example teaches failure mechanics instead of the documented success + boundary behavior.

## Hard Blockers
- none

## Probe Strategy Declaration
- Callable probe strategy: documented invocation (explicit input array cases), not zero-arg probing.
- Rationale: `tail` has required arity (`length === 1`) and source docs already provide deterministic, contract-aligned calls.

## Semantic Risks
- High: failure-first zero-arg output can imply that calling `tail` is error-prone, despite straightforward valid usage.
- Medium: learners may miss the core behavior (`[2,3,4]` vs `undefined`) because it is shown only in static JSDoc text, not runtime logs.
- Medium: current failure message may normalize argument-contract violations as an acceptable primary example path.

## Behavior Alignment Check
- Summary/JSDoc intent:
  - Returns all elements except the first, or `undefined` if the array is empty.
- Example behavior alignment:
  - Example 1 aligns (introspection).
  - Example 2 does not align; it demonstrates missing-argument failure rather than documented usage.
- Gaps:
  - Missing executable demonstration of both canonical outcomes from source example.
  - Missing concise contract note that `tail` expects an array input at runtime.

## Proposed Changes
### Documentation
- For required-arity function exports, require one executable documented invocation plus one boundary-case invocation (e.g., non-empty and empty array).
- Add a short contract note pattern for runtime argument expectations when a bad call would throw.

### Prompt
- In `function-like.md`, add a hard rule: when required arity is detected or known from docs, do not use zero-arg probing as the primary invocation example.
- Require invocation examples to reuse source JSDoc calls when available before adding generic probes.

### Agent Config
- Keep `disallow_zero_arg_probe_when_required_arity_detected: true` and enforce it as a hard fail for function exports.
- Add `require_documented_invocation_for_function_like: true`.
- Add `fail_if_invocation_example_only_shows_failure: true` to prevent pedagogically misleading examples.

## Proposed Patch Sketch (Not Applied)
```diff
--- a/src/effect/Array/exports/tail.function.ts
+++ b/src/effect/Array/exports/tail.function.ts
@@
 import {
   createPlaygroundProgram,
-  inspectNamedExport,
-  probeNamedExportFunction,
+  inspectNamedExport,
 } from "@beep/groking-effect-v4/runtime/Playground";
@@
 const exampleFunctionInvocation = Effect.gen(function* () {
-  yield* Console.log("Execute a safe zero-arg invocation probe.");
-  yield* probeNamedExportFunction({ moduleRecord, exportName });
+  yield* Console.log("Run documented invocations for tail behavior.");
+  const nonEmpty = ArrayModule.tail([1, 2, 3, 4]);
+  const empty = ArrayModule.tail([]);
+  yield* Console.log(`Array.tail([1, 2, 3, 4]) => ${JSON.stringify(nonEmpty)}`);
+  yield* Console.log(`Array.tail([]) => ${String(empty)}`);
+  yield* Console.log("Contract note: tail expects a ReadonlyArray input.");
 });
@@
     {
-      title: "Zero-Arg Invocation Probe",
-      description: "Attempt invocation and report success/failure details.",
+      title: "Documented Invocation",
+      description: "Demonstrate non-empty and empty input outcomes.",
       run: exampleFunctionInvocation,
     },
   ],
 });
```

## Estimated Real Run Effort
- Estimated duration: 10-15 minutes (single-file edit + Bun verification).
- Confidence: high (0.95).
- Primary risks:
  - Minor wording drift in logs vs existing style conventions.
  - Ensuring concise output while still making contract expectations explicit.
