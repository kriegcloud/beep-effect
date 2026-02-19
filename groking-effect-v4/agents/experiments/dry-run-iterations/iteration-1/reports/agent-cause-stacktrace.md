# Dry-Run Feedback Report

## Metadata
- Agent ID: `agent-cause-stacktrace`
- Iteration: `iteration-1`
- Export file: `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/StackTrace.class.ts`
- Export kind: `class`
- Prompt bundle: `shared/base-system.md`, `kinds/class-like.md`, `shared/dry-run-overlay.md`
- Config bundle: Not explicitly specified in prompt (assumed default agent/runtime config)

## What Worked
- The target export file is structurally correct, compiles, and runs successfully with Bun.
- Existing examples (`Class Discovery`, `Zero-Arg Construction Probe`) execute without crashing and keep the output concise.
- Runtime probing confirmed `Cause.StackTrace` is constructable (`new Cause.StackTrace()` succeeds) and usable as a `ServiceMap` key.
- Upstream source docs provide a clear semantic direction: retrieve via `ServiceMap.get(Cause.reasonAnnotations(reason), Cause.StackTrace)`.

## What Didn't
- The current examples are mostly mechanical and do not demonstrate the core semantic use-case of `StackTrace` as an annotation key.
- `inspectNamedExport` produced a low-signal preview (`<?>`) for this export, so discovery output is not very informative.
- The constructor probe output (`{}`) does not help users understand how to use `StackTrace` in real Effect error/cause workflows.
- No source inline example exists, and the generated file does not add a replacement domain example to close that gap.
- Demonstrating runtime-captured stack metadata directly can be non-deterministic; current template lacks a stable pattern for this class of export.

## Proposed Changes
### Documentation
- Add a short cookbook entry for annotation-key classes (`Cause.StackTrace`, `Cause.InterruptorStackTrace`) showing a deterministic `ServiceMap` round-trip.
- Document expected runtime shape/expectations for stack-frame payload values to reduce guesswork in examples.

### Prompt
- For `class-like` exports that are key markers (e.g., `extends ServiceMap.Service`), require at least one semantic usage example in addition to constructor/discovery probes.
- Add a heuristic: if summary contains "ServiceMap key", prioritize `add/get` or `annotate/reasonAnnotations` examples.

### Agent Config
- Add a reusable playground helper for `ServiceMap` key round-trip demonstrations to avoid repetitive hand-written boilerplate.
- Improve function/class preview fallback in runtime helpers (e.g., property-name introspection when stringification is unhelpful).

## Proposed Patch Sketch (Not Applied)
```diff
diff --git a/src/effect/Cause/exports/StackTrace.class.ts b/src/effect/Cause/exports/StackTrace.class.ts
--- a/src/effect/Cause/exports/StackTrace.class.ts
+++ b/src/effect/Cause/exports/StackTrace.class.ts
@@
 import * as Effect from "effect/Effect";
 import * as Console from "effect/Console";
+import * as ServiceMap from "effect/ServiceMap";
 import * as BunContext from "@effect/platform-bun/BunContext";
 import * as BunRuntime from "@effect/platform-bun/BunRuntime";
 import * as CauseModule from "effect/Cause";
@@
 const exampleConstructionProbe = Effect.gen(function* () {
   yield* Console.log("Attempt a zero-arg construction probe.");
   yield* probeNamedExportConstructor({ moduleRecord, exportName });
 });
+
+const exampleServiceMapRoundTrip = Effect.gen(function* () {
+  yield* Console.log("Store and retrieve a synthetic frame via Cause.StackTrace key.");
+
+  const syntheticFrame = {
+    fileName: "demo.ts",
+    line: 12,
+    column: 4,
+    name: "demoFn"
+  } as any;
+
+  const annotations = ServiceMap.add(ServiceMap.empty(), CauseModule.StackTrace, syntheticFrame);
+  const restored = ServiceMap.getOrUndefined(annotations, CauseModule.StackTrace);
+
+  yield* Console.log(`Restored frame: ${JSON.stringify(restored, null, 2)}`);
+});
+
+const exampleReasonAnnotationRoundTrip = Effect.gen(function* () {
+  yield* Console.log("Annotate a fail cause, then read StackTrace via reasonAnnotations.");
+
+  const syntheticFrame = {
+    fileName: "demo.ts",
+    line: 21,
+    column: 7,
+    name: "boom"
+  } as any;
+
+  const cause = CauseModule.fail("boom");
+  const annotated = CauseModule.annotate(
+    cause,
+    ServiceMap.add(ServiceMap.empty(), CauseModule.StackTrace, syntheticFrame)
+  );
+
+  const firstReason = (annotated as any).reasons?.[0];
+  const frame = firstReason
+    ? ServiceMap.getOrUndefined(CauseModule.reasonAnnotations(firstReason), CauseModule.StackTrace)
+    : undefined;
+
+  yield* Console.log(`Reason frame: ${JSON.stringify(frame, null, 2)}`);
+});
@@
     {
       title: "Zero-Arg Construction Probe",
       description: "Attempt construction and report constructor behavior.",
       run: exampleConstructionProbe
+    },
+    {
+      title: "ServiceMap Key Round Trip",
+      description: "Use StackTrace as key for deterministic annotation lookup.",
+      run: exampleServiceMapRoundTrip
+    },
+    {
+      title: "Reason Annotation Round Trip",
+      description: "Attach StackTrace to a cause and read it back via reason annotations.",
+      run: exampleReasonAnnotationRoundTrip
     }
   ]
 });
```

## Estimated Real Run Effort
- Estimated duration: 25-40 minutes (implement + run + log quality pass)
- Confidence: Medium-high
- Primary risks: stack-frame payload typing ergonomics (`StackFrame` construction), avoiding brittle reliance on internal reason structure, keeping examples deterministic across runtime versions.
