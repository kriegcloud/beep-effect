/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SubscriptionRef
 * Export: getAndUpdate
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/SubscriptionRef.ts
 * Generated: 2026-02-19T04:14:21.693Z
 *
 * Overview:
 * Atomically retrieves the current value and updates it with the result of applying a function, notifying subscribers of the change.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(10)
 *
 *   const oldValue = yield* SubscriptionRef.getAndUpdate(ref, (n) => n * 2)
 *   console.log("Old value:", oldValue)
 *
 *   const newValue = yield* SubscriptionRef.get(ref)
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as SubscriptionRefModule from "effect/SubscriptionRef";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getAndUpdate";
const exportKind = "const";
const moduleImportPath = "effect/SubscriptionRef";
const sourceSummary =
  "Atomically retrieves the current value and updates it with the result of applying a function, notifying subscribers of the change.";
const sourceExample =
  'import { Effect, SubscriptionRef } from "effect"\n\nconst program = Effect.gen(function*() {\n  const ref = yield* SubscriptionRef.make(10)\n\n  const oldValue = yield* SubscriptionRef.getAndUpdate(ref, (n) => n * 2)\n  console.log("Old value:", oldValue)\n\n  const newValue = yield* SubscriptionRef.get(ref)\n  console.log("New value:", newValue)\n})';
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
