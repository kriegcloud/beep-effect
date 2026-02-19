/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SubscriptionRef
 * Export: modifyEffect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/SubscriptionRef.ts
 * Generated: 2026-02-19T04:14:21.694Z
 *
 * Overview:
 * Atomically modifies the `SubscriptionRef` with an effectful function that computes a return value and a new value, notifying subscribers of the change.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(10)
 *
 *   const result = yield* SubscriptionRef.modifyEffect(
 *     ref,
 *     (n) => Effect.succeed([`Doubled from ${n}`, n * 2] as const)
 *   )
 *   console.log(result)
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
const exportName = "modifyEffect";
const exportKind = "const";
const moduleImportPath = "effect/SubscriptionRef";
const sourceSummary =
  "Atomically modifies the `SubscriptionRef` with an effectful function that computes a return value and a new value, notifying subscribers of the change.";
const sourceExample =
  'import { Effect, SubscriptionRef } from "effect"\n\nconst program = Effect.gen(function*() {\n  const ref = yield* SubscriptionRef.make(10)\n\n  const result = yield* SubscriptionRef.modifyEffect(\n    ref,\n    (n) => Effect.succeed([`Doubled from ${n}`, n * 2] as const)\n  )\n  console.log(result)\n\n  const newValue = yield* SubscriptionRef.get(ref)\n  console.log("New value:", newValue)\n})';
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
