/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberHandle
 * Export: FiberHandle
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/FiberHandle.ts
 * Generated: 2026-02-19T04:14:12.851Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Fiber, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   // Create a FiberHandle that can hold fibers producing strings
 *   const handle = yield* FiberHandle.make<string, never>()
 *
 *   // The handle can store and manage a single fiber
 *   const fiber = yield* FiberHandle.run(handle, Effect.succeed("hello"))
 *   const result = yield* Fiber.await(fiber)
 *   console.log(result) // "hello"
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FiberHandleModule from "effect/FiberHandle";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "FiberHandle";
const exportKind = "interface";
const moduleImportPath = "effect/FiberHandle";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample =
  'import { Effect, Fiber, FiberHandle } from "effect"\n\nEffect.gen(function*() {\n  // Create a FiberHandle that can hold fibers producing strings\n  const handle = yield* FiberHandle.make<string, never>()\n\n  // The handle can store and manage a single fiber\n  const fiber = yield* FiberHandle.run(handle, Effect.succeed("hello"))\n  const result = yield* Fiber.await(fiber)\n  console.log(result) // "hello"\n})';
const moduleRecord = FiberHandleModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
