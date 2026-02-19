/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: makeLatchUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.911Z
 *
 * Overview:
 * Creates a new Latch.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const latch = Effect.makeLatchUnsafe(false)
 *
 * const waiter = Effect.gen(function*() {
 *   yield* Effect.log("Waiting for latch to open...")
 *   yield* latch.await
 *   yield* Effect.log("Latch opened! Continuing...")
 * })
 *
 * const opener = Effect.gen(function*() {
 *   yield* Effect.sleep("2 seconds")
 *   yield* Effect.log("Opening latch...")
 *   yield* latch.open
 * })
 *
 * const program = Effect.all([waiter, opener])
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeLatchUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Creates a new Latch.";
const sourceExample =
  'import { Effect } from "effect"\n\nconst latch = Effect.makeLatchUnsafe(false)\n\nconst waiter = Effect.gen(function*() {\n  yield* Effect.log("Waiting for latch to open...")\n  yield* latch.await\n  yield* Effect.log("Latch opened! Continuing...")\n})\n\nconst opener = Effect.gen(function*() {\n  yield* Effect.sleep("2 seconds")\n  yield* Effect.log("Opening latch...")\n  yield* latch.open\n})\n\nconst program = Effect.all([waiter, opener])';
const moduleRecord = EffectModule as Record<string, unknown>;

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
