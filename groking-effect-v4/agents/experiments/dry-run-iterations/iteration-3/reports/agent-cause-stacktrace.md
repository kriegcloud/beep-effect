# Dry-Run Feedback Report

## Metadata
- Agent ID: agent-cause-stacktrace
- Iteration: 3
- Export file: /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/StackTrace.class.ts
- Export kind: class
- Prompt bundle:
  - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/prompts/shared/base-system.md
  - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/prompts/kinds/class-like.md
  - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/prompts/shared/dry-run-overlay.md
- Config bundle:
  - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/configs/dry-run.worker.jsonc

## What Worked
- Dry-run constraints were followed: target export file was not modified and only report output was produced.
- Runtime execution succeeds with Bun (`bun .../StackTrace.class.ts`): both examples complete and process exits 0.
- Class discovery confirms export presence (`typeof` is `function`) and constructor probe is executable in this runtime.
- Execution failures: none observed.

## What Didn't
- The generated examples are mechanically valid but do not demonstrate `StackTrace` in its intended domain role.
- No round-trip behavior is shown for key-marker semantics (`annotate`/`reasonAnnotations` + `ServiceMap` lookup).
- The second example is a zero-arg constructor probe, which over-indexes on class mechanics and under-teaches actual usage.
- Discovery output preview (`<?>`) provides limited instructional value for this export.

## Hard Blockers
- Status: none.
- Notes: no runtime or API-access blocker prevents implementing a summary-aligned example in a real edit run.

## Semantic Risks
- Summary-behavior contradiction: summary says "`ServiceMap` key for the stack frame captured at the point of failure," but examples never use `ServiceMap` or reason annotations.
- Learners may incorrectly infer that `new Cause.StackTrace()` is the primary API path.
- Without safe lookup semantics, future examples may normalize throwing lookups for optional metadata instead of `getOption` / `getOrUndefined`.
- Absence handling is not demonstrated, so users do not learn that stack-trace annotations may be unavailable depending on runtime conditions.

## Behavior Alignment Check
- Summary/JSDoc intent:
  - `StackTrace` is a key used to read failure-point stack frame metadata from cause annotations.
- Example behavior alignment:
  - Current examples verify export existence and constructability only.
- Gaps:
  - Missing domain round-trip (`Cause.annotate` -> `Cause.reasonAnnotations` -> `ServiceMap` lookup).
  - Missing optional metadata safety pattern.
  - Missing explicit explanation of when stack-trace data may be absent.

## Proposed Changes
### Documentation
- Add a source/JSDoc snippet for `StackTrace` that performs an annotation round-trip and safe retrieval.
- Add one short note clarifying that stack-trace annotations are availability-dependent.
- Add a key-marker cookbook section for `Cause.StackTrace` / `Cause.InterruptorStackTrace` showing deterministic synthetic annotation examples.

### Prompt
- Strengthen class-like guidance with a hard acceptance criterion: if summary includes key-marker triggers, require at least one domain round-trip example.
- Add a contradiction guard: fail dry-run quality when example behavior does not exercise APIs implied by summary/JSDoc.
- Reframe constructor probes as optional diagnostics only, never the primary second example for semantic-key exports.

### Agent Config
- Keep existing key-marker guardrails and tighten with explicit pass/fail keys for real runs:
  - `"require_domain_semantic_round_trip_for_key_markers": true`
  - `"require_alignment_contradiction_callout": true`
  - `"require_safe_lookup_for_optional_metadata": true`
  - `"disallow_constructor_probe_as_primary_semantic_example": true`
  - `"fail_if_all_examples_are_reflective": true`

## Proposed Patch Sketch (Not Applied)
```diff
--- a/src/effect/Cause/exports/StackTrace.class.ts
+++ b/src/effect/Cause/exports/StackTrace.class.ts
@@
 import * as Effect from "effect/Effect";
 import * as Console from "effect/Console";
+import * as ServiceMap from "effect/ServiceMap";
@@
-import {
-  createPlaygroundProgram,
-  inspectNamedExport,
-  probeNamedExportConstructor
-} from "@beep/groking-effect-v4/runtime/Playground";
+import {
+  createPlaygroundProgram,
+  inspectNamedExport
+} from "@beep/groking-effect-v4/runtime/Playground";
@@
-const exampleConstructionProbe = Effect.gen(function* () {
-  yield* Console.log("Attempt a zero-arg construction probe.");
-  yield* probeNamedExportConstructor({ moduleRecord, exportName });
+const exampleStackTraceRoundTrip = Effect.gen(function* () {
+  yield* Console.log("Attach and retrieve StackTrace via reason annotations.");
+  const syntheticFrame = {
+    name: "demo-failure",
+    stack: () => "Error: demo-failure\\n    at stacktrace-roundtrip",
+    parent: undefined
+  };
+
+  const cause = CauseModule.fail("boom");
+  const annotated = CauseModule.annotate(
+    cause,
+    ServiceMap.make(CauseModule.StackTrace, syntheticFrame)
+  );
+
+  const reason = annotated.reasons[0];
+  if (reason === undefined) {
+    yield* Console.log("No reason found; cannot inspect annotations.");
+    return;
+  }
+
+  const restored = ServiceMap.getOrUndefined(
+    CauseModule.reasonAnnotations(reason),
+    CauseModule.StackTrace
+  );
+
+  yield* Console.log(`StackTrace present: ${restored !== undefined}`);
+  if (restored !== undefined) {
+    yield* Console.log(`Frame name: ${restored.name}`);
+  }
 });
@@
-      title: "Zero-Arg Construction Probe",
-      description: "Attempt construction and report constructor behavior.",
-      run: exampleConstructionProbe
+      title: "Annotation Key Round-Trip",
+      description: "Use StackTrace as a ServiceMap key and read it back from reason annotations.",
+      run: exampleStackTraceRoundTrip
     }
   ]
 });
```

## Estimated Real Run Effort
- Estimated duration: 20-30 minutes (edit + local run + output polish).
- Confidence: high (0.90).
- Primary risks:
  - Minor API-shape differences across Effect versions (`reason` access and safe lookup helpers).
  - Need to keep example deterministic while still teaching real annotation semantics.
