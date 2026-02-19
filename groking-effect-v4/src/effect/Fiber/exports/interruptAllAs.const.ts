/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Fiber
 * Export: interruptAllAs
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Fiber.ts
 * Generated: 2026-02-19T04:14:12.663Z
 *
 * Overview:
 * Interrupts all fibers in the provided iterable using the specified fiber ID as the interrupting fiber. This allows you to control which fiber is considered the source of the interruption, which can be useful for debugging and tracing.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Fiber } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create a controlling fiber
 *   const controllerFiber = yield* Effect.forkChild(Effect.succeed("controller"))
 *
 *   // Create multiple worker fibers
 *   const worker1 = yield* Effect.forkChild(
 *     Effect.gen(function*() {
 *       yield* Effect.sleep("5 seconds")
 *       yield* Console.log("Worker 1 completed")
 *       return "worker1"
 *     })
 *   )
 *
 *   const worker2 = yield* Effect.forkChild(
 *     Effect.gen(function*() {
 *       yield* Effect.sleep("3 seconds")
 *       yield* Console.log("Worker 2 completed")
 *       return "worker2"
 *     })
 *   )
 *
 *   // Interrupt all workers using the controller fiber's ID
 *   yield* Effect.sleep("1 second")
 *   yield* Console.log("Interrupting workers from controller...")
 *   yield* Fiber.interruptAllAs([worker1, worker2], controllerFiber.id)
 *   yield* Console.log("All workers interrupted by controller")
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
import * as FiberModule from "effect/Fiber";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "interruptAllAs";
const exportKind = "const";
const moduleImportPath = "effect/Fiber";
const sourceSummary =
  "Interrupts all fibers in the provided iterable using the specified fiber ID as the interrupting fiber. This allows you to control which fiber is considered the source of the int...";
const sourceExample =
  'import { Console, Effect, Fiber } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create a controlling fiber\n  const controllerFiber = yield* Effect.forkChild(Effect.succeed("controller"))\n\n  // Create multiple worker fibers\n  const worker1 = yield* Effect.forkChild(\n    Effect.gen(function*() {\n      yield* Effect.sleep("5 seconds")\n      yield* Console.log("Worker 1 completed")\n      return "worker1"\n    })\n  )\n\n  const worker2 = yield* Effect.forkChild(\n    Effect.gen(function*() {\n      yield* Effect.sleep("3 seconds")\n      yield* Console.log("Worker 2 completed")\n      return "worker2"\n    })\n  )\n\n  // Interrupt all workers using the controller fiber\'s ID\n  yield* Effect.sleep("1 second")\n  yield* Console.log("Interrupting workers from controller...")\n  yield* Fiber.interruptAllAs([worker1, worker2], controllerFiber.id)\n  yield* Console.log("All workers interrupted by controller")\n})';
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
