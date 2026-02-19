/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberHandle
 * Export: clear
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FiberHandle.ts
 * Generated: 2026-02-19T04:50:36.207Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *
 *   // Add a fiber
 *   yield* FiberHandle.run(handle, Effect.never)
 *
 *   // Clear the handle, interrupting the fiber
 *   yield* FiberHandle.clear(handle)
 *
 *   // The handle is now empty
 *   const fiber = FiberHandle.getUnsafe(handle)
 *   console.log(fiber) // undefined
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
import * as FiberHandleModule from "effect/FiberHandle";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "clear";
const exportKind = "const";
const moduleImportPath = "effect/FiberHandle";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample =
  'import { Effect, FiberHandle } from "effect"\n\nEffect.gen(function*() {\n  const handle = yield* FiberHandle.make()\n\n  // Add a fiber\n  yield* FiberHandle.run(handle, Effect.never)\n\n  // Clear the handle, interrupting the fiber\n  yield* FiberHandle.clear(handle)\n\n  // The handle is now empty\n  const fiber = FiberHandle.getUnsafe(handle)\n  console.log(fiber) // undefined\n})';
const moduleRecord = FiberHandleModule as Record<string, unknown>;

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
