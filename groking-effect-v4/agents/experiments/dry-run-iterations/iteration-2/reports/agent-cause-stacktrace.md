# Dry-Run Feedback Report

## Metadata
- Agent ID: agent-cause-stacktrace
- Iteration: 2
- Export file: /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/StackTrace.class.ts
- Export kind: class
- Prompt bundle:
  - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/prompts/shared/base-system.md
  - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/prompts/kinds/class-like.md
  - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/prompts/shared/dry-run-overlay.md
- Config bundle:
  - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/configs/dry-run.worker.jsonc

## What Worked
- The target file runs successfully with Bun (`bun .../StackTrace.class.ts`) and both examples complete without runtime failure.
- The discovery block correctly identifies `StackTrace` as a runtime function-like export and provides module-level context.
- The constructor probe is safe in this environment (`Reflect.construct` succeeds) and does not block execution.
- Hard blockers: none observed for implementation mechanics in this specific export.

## What Didn't
- The output does not demonstrate the intended domain usage of `Cause.StackTrace` as a `ServiceMap` key on reason annotations.
- The constructor result (`{}`) is mechanically valid but not pedagogically useful for this export’s semantics.
- Runtime preview falls back to `<?>`, so the discovery log provides little actionable detail.
- No example exercises `Cause.reasonAnnotations(...)` or `ServiceMap` lookup behavior, so the summary claim is not validated in code.

## Semantic Risks
- Learners may infer that `new Cause.StackTrace()` is the intended primary usage, while the real value is key-based lookup in annotations.
- If future generated examples use `ServiceMap.get` directly, absent annotations will throw; this can create brittle demos unless safe lookup (`getOption`/`getOrUndefined`) is used.
- The summary phrase “when a stack frame is available” is not reflected in runtime behavior, which can hide the optional/availability nuance.
- Reusing generic constructor probes for marker/key classes creates a pattern of technically passing but semantically shallow examples.

## Behavior Alignment Check
- Summary/JSDoc intent:
  - `StackTrace` is a `ServiceMap` key for failure-point stack frames.
  - Intended retrieval path is from reason annotations (e.g., `Cause.reasonAnnotations(reason)` + `ServiceMap` lookup).
- Example behavior alignment:
  - Current examples show export discoverability and constructor mechanics only.
- Gaps:
  - Missing key round-trip demonstration (`annotate` -> `reasonAnnotations` -> lookup).
  - Missing safe handling of absent stack-trace annotations.
  - Missing explanation that runtime-provided stack traces are availability-dependent.

## Proposed Changes
### Documentation
- Add an inline JSDoc/source example for `StackTrace` showing annotation round-trip with `Cause.annotate` and `Cause.reasonAnnotations`.
- Document safe lookup (`ServiceMap.getOption`) for teaching contexts to avoid exception-driven control flow.
- Explicitly note that runtime stack trace annotation may be absent in some execution contexts.

### Prompt
- Strengthen `class-like.md` rule for summary-matched semantic keys: when summary contains phrases like “`ServiceMap` key”, require one domain round-trip example and treat constructor probes as optional diagnostics only.
- Add acceptance criteria in prompt text: at least one example must exercise the API named in summary/JSDoc intent.
- Add explicit anti-pattern guidance: avoid “zero-arg construction probe” as the second example when semantic APIs are known.

### Agent Config
- Add semantic guardrails to dry-run/worker config, for example:
  - `"require_domain_semantic_round_trip": true`
  - `"semantic_trigger_phrases": ["ServiceMap key", "Reference"]`
  - `"disallow_constructor_probe_for_semantic_keys": true`
  - `"require_safe_lookup_for_optional_metadata": true`
- Add a lightweight validation check that fails dry-run quality when all examples are reflective/mechanical and none exercise intended domain operations.

## Proposed Patch Sketch (Not Applied)
```diff
--- a/src/effect/Cause/exports/StackTrace.class.ts
+++ b/src/effect/Cause/exports/StackTrace.class.ts
@@
 import * as Effect from "effect/Effect";
 import * as Console from "effect/Console";
+import * as Option from "effect/Option";
+import * as ServiceMap from "effect/ServiceMap";
@@
-const exampleConstructionProbe = Effect.gen(function* () {
-  yield* Console.log("Attempt a zero-arg construction probe.");
-  yield* probeNamedExportConstructor({ moduleRecord, exportName });
+const exampleStackTraceRoundTrip = Effect.gen(function* () {
+  yield* Console.log("Attach and read a StackTrace annotation from a failure reason.");
+  const frame = {
+    name: "demo-failure",
+    stack: () => "Error: demo-failure\\n    at stacktrace-roundtrip",
+    parent: undefined
+  };
+  const cause = CauseModule.fail("boom");
+  const annotated = CauseModule.annotate(cause, ServiceMap.make(CauseModule.StackTrace, frame));
+  const reason = annotated.reasons[0];
+  if (reason === undefined) {
+    yield* Console.log("No reason found on annotated cause.");
+    return;
+  }
+  const stackOpt = ServiceMap.getOption(CauseModule.reasonAnnotations(reason), CauseModule.StackTrace);
+  yield* Console.log(`StackTrace present: ${Option.isSome(stackOpt)}`);
+  if (Option.isSome(stackOpt)) {
+    yield* Console.log(`Frame name: ${stackOpt.value.name}`);
+  }
 });
@@
-      title: "Zero-Arg Construction Probe",
-      description: "Attempt construction and report constructor behavior.",
-      run: exampleConstructionProbe
+      title: "Annotation Round-Trip",
+      description: "Store and read StackTrace as a Cause reason annotation key.",
+      run: exampleStackTraceRoundTrip
     }
   ]
 });
```

## Estimated Real Run Effort
- Estimated duration: 20-35 minutes (edit + local run verification + log wording refinement).
- Confidence: High (0.88).
- Primary risks:
  - `Cause`/`ServiceMap` API surface may shift across Effect versions (especially lookup helpers).
  - Runtime-captured stack metadata may remain absent in some contexts; examples should use deterministic synthetic annotation for pedagogy.
  - Formatting/logging for function-valued `stack` fields can be noisy without explicit projection.
