/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Deferred
 * Export: Deferred
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Deferred.ts
 * Generated: 2026-02-19T04:14:11.284Z
 *
 * Overview:
 * A `Deferred` represents an asynchronous variable that can be set exactly once, with the ability for an arbitrary number of fibers to suspend (by calling `Deferred.await`) and automatically resume when the variable is set.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Deferred, Effect, Fiber } from "effect"
 * 
 * // Create and use a Deferred for inter-fiber communication
 * const program = Effect.gen(function*() {
 *   // Create a Deferred that will hold a string value
 *   const deferred: Deferred.Deferred<string> = yield* Deferred.make<string>()
 * 
 *   // Fork a fiber that will set the deferred value
 *   const producer = yield* Effect.forkChild(
 *     Effect.gen(function*() {
 *       yield* Effect.sleep("100 millis")
 *       yield* Deferred.succeed(deferred, "Hello, World!")
 *     })
 *   )
 * 
 *   // Fork a fiber that will await the deferred value
 *   const consumer = yield* Effect.forkChild(
 *     Effect.gen(function*() {
 *       const value = yield* Deferred.await(deferred)
 *       console.log("Received:", value)
 *       return value
 *     })
 *   )
 * 
 *   // Wait for both fibers to complete
 *   yield* Fiber.join(producer)
 *   const result = yield* Fiber.join(consumer)
 *   return result
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as DeferredModule from "effect/Deferred";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Deferred";
const exportKind = "interface";
const moduleImportPath = "effect/Deferred";
const sourceSummary = "A `Deferred` represents an asynchronous variable that can be set exactly once, with the ability for an arbitrary number of fibers to suspend (by calling `Deferred.await`) and au...";
const sourceExample = "import { Deferred, Effect, Fiber } from \"effect\"\n\n// Create and use a Deferred for inter-fiber communication\nconst program = Effect.gen(function*() {\n  // Create a Deferred that will hold a string value\n  const deferred: Deferred.Deferred<string> = yield* Deferred.make<string>()\n\n  // Fork a fiber that will set the deferred value\n  const producer = yield* Effect.forkChild(\n    Effect.gen(function*() {\n      yield* Effect.sleep(\"100 millis\")\n      yield* Deferred.succeed(deferred, \"Hello, World!\")\n    })\n  )\n\n  // Fork a fiber that will await the deferred value\n  const consumer = yield* Effect.forkChild(\n    Effect.gen(function*() {\n      const value = yield* Deferred.await(deferred)\n      console.log(\"Received:\", value)\n      return value\n    })\n  )\n\n  // Wait for both fibers to complete\n  yield* Fiber.join(producer)\n  const result = yield* Fiber.join(consumer)\n  return result\n})";
const moduleRecord = DeferredModule as Record<string, unknown>;

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
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
