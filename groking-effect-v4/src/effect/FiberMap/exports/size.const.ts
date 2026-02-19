/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberMap
 * Export: size
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FiberMap.ts
 * Generated: 2026-02-19T04:14:13.039Z
 *
 * Overview:
 * Get the number of fibers currently in the FiberMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *
 *   console.log(yield* FiberMap.size(map)) // 0
 *
 *   // Add some fibers
 *   yield* FiberMap.run(map, "task1", Effect.never)
 *   yield* FiberMap.run(map, "task2", Effect.never)
 *
 *   console.log(yield* FiberMap.size(map)) // 2
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
import * as FiberMapModule from "effect/FiberMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "size";
const exportKind = "const";
const moduleImportPath = "effect/FiberMap";
const sourceSummary = "Get the number of fibers currently in the FiberMap.";
const sourceExample =
  'import { Effect, FiberMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  const map = yield* FiberMap.make<string>()\n\n  console.log(yield* FiberMap.size(map)) // 0\n\n  // Add some fibers\n  yield* FiberMap.run(map, "task1", Effect.never)\n  yield* FiberMap.run(map, "task2", Effect.never)\n\n  console.log(yield* FiberMap.size(map)) // 2\n})';
const moduleRecord = FiberMapModule as Record<string, unknown>;

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
