/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberHandle
 * Export: getUnsafe
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/FiberHandle.ts
 * Generated: 2026-02-19T04:50:36.208Z
 *
 * Overview:
 * Retrieve the fiber from the FiberHandle.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *
 *   // No fiber initially
 *   const emptyFiber = FiberHandle.getUnsafe(handle)
 *   console.log(emptyFiber === undefined) // true
 *
 *   // Add a fiber
 *   yield* FiberHandle.run(handle, Effect.succeed("hello"))
 *   const fiber = FiberHandle.getUnsafe(handle)
 *   console.log(fiber !== undefined) // true
 * })
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
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
const exportName = "getUnsafe";
const exportKind = "function";
const moduleImportPath = "effect/FiberHandle";
const sourceSummary = "Retrieve the fiber from the FiberHandle.";
const sourceExample =
  'import { Effect, FiberHandle } from "effect"\n\nEffect.gen(function*() {\n  const handle = yield* FiberHandle.make()\n\n  // No fiber initially\n  const emptyFiber = FiberHandle.getUnsafe(handle)\n  console.log(emptyFiber === undefined) // true\n\n  // Add a fiber\n  yield* FiberHandle.run(handle, Effect.succeed("hello"))\n  const fiber = FiberHandle.getUnsafe(handle)\n  console.log(fiber !== undefined) // true\n})';
const moduleRecord = FiberHandleModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleFunctionInvocation = Effect.gen(function* () {
  yield* Console.log("Execute a safe zero-arg invocation probe.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery,
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation,
    },
  ],
});

BunRuntime.runMain(program);
