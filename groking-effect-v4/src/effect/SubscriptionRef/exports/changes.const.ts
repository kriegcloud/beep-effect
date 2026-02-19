/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SubscriptionRef
 * Export: changes
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/SubscriptionRef.ts
 * Generated: 2026-02-19T04:14:21.693Z
 *
 * Overview:
 * Creates a stream that emits the current value and all subsequent changes to the `SubscriptionRef`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Stream, SubscriptionRef } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(0)
 * 
 *   const stream = SubscriptionRef.changes(ref)
 * 
 *   const fiber = yield* Stream.runForEach(
 *     stream,
 *     (value) => Effect.sync(() => console.log("Value:", value))
 *   ).pipe(Effect.forkScoped)
 * 
 *   yield* SubscriptionRef.set(ref, 1)
 *   yield* SubscriptionRef.set(ref, 2)
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as SubscriptionRefModule from "effect/SubscriptionRef";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "changes";
const exportKind = "const";
const moduleImportPath = "effect/SubscriptionRef";
const sourceSummary = "Creates a stream that emits the current value and all subsequent changes to the `SubscriptionRef`.";
const sourceExample = "import { Effect, Stream, SubscriptionRef } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const ref = yield* SubscriptionRef.make(0)\n\n  const stream = SubscriptionRef.changes(ref)\n\n  const fiber = yield* Stream.runForEach(\n    stream,\n    (value) => Effect.sync(() => console.log(\"Value:\", value))\n  ).pipe(Effect.forkScoped)\n\n  yield* SubscriptionRef.set(ref, 1)\n  yield* SubscriptionRef.set(ref, 2)\n})";
const moduleRecord = SubscriptionRefModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
