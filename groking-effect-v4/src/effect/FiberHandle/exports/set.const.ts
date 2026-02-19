/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberHandle
 * Export: set
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FiberHandle.ts
 * Generated: 2026-02-19T04:50:36.208Z
 *
 * Overview:
 * Set the fiber in the `FiberHandle`. When the fiber completes, it will be removed from the `FiberHandle`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Fiber, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *   const fiber = Effect.runFork(Effect.succeed("hello"))
 *
 *   // Set the fiber safely
 *   yield* FiberHandle.set(handle, fiber)
 *
 *   // The fiber is now managed by the handle
 *   const result = yield* Fiber.await(fiber)
 *   console.log(result) // "hello"
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
const exportName = "set";
const exportKind = "const";
const moduleImportPath = "effect/FiberHandle";
const sourceSummary =
  "Set the fiber in the `FiberHandle`. When the fiber completes, it will be removed from the `FiberHandle`.";
const sourceExample =
  'import { Effect, Fiber, FiberHandle } from "effect"\n\nEffect.gen(function*() {\n  const handle = yield* FiberHandle.make()\n  const fiber = Effect.runFork(Effect.succeed("hello"))\n\n  // Set the fiber safely\n  yield* FiberHandle.set(handle, fiber)\n\n  // The fiber is now managed by the handle\n  const result = yield* Fiber.await(fiber)\n  console.log(result) // "hello"\n})';
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
