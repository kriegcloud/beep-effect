/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Fiber
 * Export: Fiber
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Fiber.ts
 * Generated: 2026-02-19T04:50:36.065Z
 *
 * Overview:
 * A runtime fiber is a lightweight thread that executes Effects. Fibers are the unit of concurrency in Effect. They provide a way to run multiple Effects concurrently while maintaining structured concurrency and cancellation safety.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Fiber } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Fork an effect to run in a new fiber
 *   const fiber = yield* Effect.forkChild(Effect.succeed(42))
 *
 *   // Wait for the fiber to complete and get its result
 *   const result = yield* Fiber.await(fiber)
 *   console.log(result) // Exit.succeed(42)
 *
 *   return result
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FiberModule from "effect/Fiber";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Fiber";
const exportKind = "interface";
const moduleImportPath = "effect/Fiber";
const sourceSummary =
  "A runtime fiber is a lightweight thread that executes Effects. Fibers are the unit of concurrency in Effect. They provide a way to run multiple Effects concurrently while mainta...";
const sourceExample =
  'import { Effect, Fiber } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Fork an effect to run in a new fiber\n  const fiber = yield* Effect.forkChild(Effect.succeed(42))\n\n  // Wait for the fiber to complete and get its result\n  const result = yield* Fiber.await(fiber)\n  console.log(result) // Exit.succeed(42)\n\n  return result\n})';
const moduleRecord = FiberModule as Record<string, unknown>;

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
