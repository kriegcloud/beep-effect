/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Fiber
 * Export: interruptAll
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Fiber.ts
 * Generated: 2026-02-19T04:14:12.663Z
 *
 * Overview:
 * Interrupts all fibers in the provided iterable, causing them to stop executing and clean up any acquired resources.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Fiber } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   // Create multiple long-running fibers
 *   const fiber1 = yield* Effect.forkChild(
 *     Effect.gen(function*() {
 *       yield* Effect.sleep("5 seconds")
 *       yield* Console.log("Task 1 completed")
 *       return "result1"
 *     })
 *   )
 * 
 *   const fiber2 = yield* Effect.forkChild(
 *     Effect.gen(function*() {
 *       yield* Effect.sleep("3 seconds")
 *       yield* Console.log("Task 2 completed")
 *       return "result2"
 *     })
 *   )
 * 
 *   const fiber3 = yield* Effect.forkChild(
 *     Effect.gen(function*() {
 *       yield* Effect.sleep("4 seconds")
 *       yield* Console.log("Task 3 completed")
 *       return "result3"
 *     })
 *   )
 * 
 *   // Wait a bit, then interrupt all fibers
 *   yield* Effect.sleep("1 second")
 *   yield* Console.log("Interrupting all fibers...")
 *   yield* Fiber.interruptAll([fiber1, fiber2, fiber3])
 *   yield* Console.log("All fibers have been interrupted")
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as FiberModule from "effect/Fiber";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "interruptAll";
const exportKind = "const";
const moduleImportPath = "effect/Fiber";
const sourceSummary = "Interrupts all fibers in the provided iterable, causing them to stop executing and clean up any acquired resources.";
const sourceExample = "import { Console, Effect, Fiber } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  // Create multiple long-running fibers\n  const fiber1 = yield* Effect.forkChild(\n    Effect.gen(function*() {\n      yield* Effect.sleep(\"5 seconds\")\n      yield* Console.log(\"Task 1 completed\")\n      return \"result1\"\n    })\n  )\n\n  const fiber2 = yield* Effect.forkChild(\n    Effect.gen(function*() {\n      yield* Effect.sleep(\"3 seconds\")\n      yield* Console.log(\"Task 2 completed\")\n      return \"result2\"\n    })\n  )\n\n  const fiber3 = yield* Effect.forkChild(\n    Effect.gen(function*() {\n      yield* Effect.sleep(\"4 seconds\")\n      yield* Console.log(\"Task 3 completed\")\n      return \"result3\"\n    })\n  )\n\n  // Wait a bit, then interrupt all fibers\n  yield* Effect.sleep(\"1 second\")\n  yield* Console.log(\"Interrupting all fibers...\")\n  yield* Fiber.interruptAll([fiber1, fiber2, fiber3])\n  yield* Console.log(\"All fibers have been interrupted\")\n})";
const moduleRecord = FiberModule as Record<string, unknown>;

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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
