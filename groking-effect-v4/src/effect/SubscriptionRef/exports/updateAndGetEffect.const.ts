/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SubscriptionRef
 * Export: updateAndGetEffect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/SubscriptionRef.ts
 * Generated: 2026-02-19T04:50:42.696Z
 *
 * Overview:
 * Updates the value of the `SubscriptionRef` with the result of applying an effectful function and returns the new value, notifying subscribers of the change.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(10)
 *
 *   const newValue = yield* SubscriptionRef.updateAndGetEffect(
 *     ref,
 *     (n) => Effect.succeed(n + 5)
 *   )
 *   console.log("New value:", newValue)
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SubscriptionRefModule from "effect/SubscriptionRef";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "updateAndGetEffect";
const exportKind = "const";
const moduleImportPath = "effect/SubscriptionRef";
const sourceSummary =
  "Updates the value of the `SubscriptionRef` with the result of applying an effectful function and returns the new value, notifying subscribers of the change.";
const sourceExample =
  'import { Effect, SubscriptionRef } from "effect"\n\nconst program = Effect.gen(function*() {\n  const ref = yield* SubscriptionRef.make(10)\n\n  const newValue = yield* SubscriptionRef.updateAndGetEffect(\n    ref,\n    (n) => Effect.succeed(n + 5)\n  )\n  console.log("New value:", newValue)\n})';
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
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
