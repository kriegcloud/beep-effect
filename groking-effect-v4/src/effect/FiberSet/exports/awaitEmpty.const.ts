/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberSet
 * Export: awaitEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FiberSet.ts
 * Generated: 2026-02-19T04:50:36.412Z
 *
 * Overview:
 * Wait until the fiber set is empty.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *
 *   // Add some fibers that will complete
 *   yield* FiberSet.run(set, Effect.sleep(100))
 *   yield* FiberSet.run(set, Effect.sleep(200))
 *
 *   // Wait for all fibers to complete
 *   yield* FiberSet.awaitEmpty(set)
 *
 *   console.log(yield* FiberSet.size(set)) // 0
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
import * as FiberSetModule from "effect/FiberSet";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "awaitEmpty";
const exportKind = "const";
const moduleImportPath = "effect/FiberSet";
const sourceSummary = "Wait until the fiber set is empty.";
const sourceExample =
  'import { Effect, FiberSet } from "effect"\n\nconst program = Effect.gen(function*() {\n  const set = yield* FiberSet.make()\n\n  // Add some fibers that will complete\n  yield* FiberSet.run(set, Effect.sleep(100))\n  yield* FiberSet.run(set, Effect.sleep(200))\n\n  // Wait for all fibers to complete\n  yield* FiberSet.awaitEmpty(set)\n\n  console.log(yield* FiberSet.size(set)) // 0\n})';
const moduleRecord = FiberSetModule as Record<string, unknown>;

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
