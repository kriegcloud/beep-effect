/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Scheduler
 * Export: MaxOpsBeforeYield
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Scheduler.ts
 * Generated: 2026-02-19T04:14:17.062Z
 *
 * Overview:
 * A service reference that controls the maximum number of operations a fiber can perform before yielding control back to the scheduler. This helps prevent long-running fibers from monopolizing the execution thread.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { MaxOpsBeforeYield } from "effect/Scheduler"
 *
 * // Configure a fiber to yield more frequently
 * const program = Effect.gen(function*() {
 *   // Get current max ops setting (default is 2048)
 *   const currentMax = yield* MaxOpsBeforeYield
 *   yield* Effect.log(`Default max ops before yield: ${currentMax}`)
 *
 *   // Run with reduced max ops for more frequent yielding
 *   return yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       const maxOps = yield* MaxOpsBeforeYield
 *       yield* Effect.log(`Max ops before yield: ${maxOps}`)
 *
 *       // Run a compute-intensive task that will yield frequently
 *       let result = 0
 *       for (let i = 0; i < 10000; i++) {
 *         result += i
 *         // This will cause yielding every 100 operations
 *         yield* Effect.sync(() => result)
 *       }
 *       return result
 *     }),
 *     MaxOpsBeforeYield,
 *     100
 *   )
 * })
 *
 * // Configure for high-performance scenarios
 * const highPerformanceProgram = Effect.gen(function*() {
 *   // Run with increased max ops for better performance (less yielding)
 *   return yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       const maxOps = yield* MaxOpsBeforeYield
 *       yield* Effect.log(`High-performance max ops: ${maxOps}`)
 *
 *       // Run multiple concurrent tasks
 *       const tasks = Array.from(
 *         { length: 100 },
 *         (_, i) =>
 *           Effect.gen(function*() {
 *             yield* Effect.sleep(`${i * 10} millis`)
 *             return `Task ${i} completed`
 *           })
 *       )
 *
 *       return yield* Effect.all(tasks, { concurrency: "unbounded" })
 *     }),
 *     MaxOpsBeforeYield,
 *     10000
 *   )
 * })
 *
 * // Configure for fair scheduling
 * const fairSchedulingProgram = Effect.gen(function*() {
 *   // Run with lower max ops for more frequent yielding
 *   return yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       const maxOps = yield* MaxOpsBeforeYield
 *       yield* Effect.log(`Fair scheduling max ops: ${maxOps}`)
 *
 *       const longRunningTask = Effect.gen(function*() {
 *         for (let i = 0; i < 1000; i++) {
 *           yield* Effect.sync(() => Math.random())
 *         }
 *         return "Long task completed"
 *       })
 *
 *       const quickTask = Effect.gen(function*() {
 *         yield* Effect.sleep("10 millis")
 *         return "Quick task completed"
 *       })
 *
 *       // Both tasks will execute fairly due to frequent yielding
 *       return yield* Effect.all([longRunningTask, quickTask], {
 *         concurrency: "unbounded"
 *       })
 *     }),
 *     MaxOpsBeforeYield,
 *     50
 *   )
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
import * as SchedulerModule from "effect/Scheduler";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "MaxOpsBeforeYield";
const exportKind = "const";
const moduleImportPath = "effect/Scheduler";
const sourceSummary =
  "A service reference that controls the maximum number of operations a fiber can perform before yielding control back to the scheduler. This helps prevent long-running fibers from...";
const sourceExample =
  'import { Effect } from "effect"\nimport { MaxOpsBeforeYield } from "effect/Scheduler"\n\n// Configure a fiber to yield more frequently\nconst program = Effect.gen(function*() {\n  // Get current max ops setting (default is 2048)\n  const currentMax = yield* MaxOpsBeforeYield\n  yield* Effect.log(`Default max ops before yield: ${currentMax}`)\n\n  // Run with reduced max ops for more frequent yielding\n  return yield* Effect.provideService(\n    Effect.gen(function*() {\n      const maxOps = yield* MaxOpsBeforeYield\n      yield* Effect.log(`Max ops before yield: ${maxOps}`)\n\n      // Run a compute-intensive task that will yield frequently\n      let result = 0\n      for (let i = 0; i < 10000; i++) {\n        result += i\n        // This will cause yielding every 100 operations\n        yield* Effect.sync(() => result)\n      }\n      return result\n    }),\n    MaxOpsBeforeYield,\n    100\n  )\n})\n\n// Configure for high-performance scenarios\nconst highPerformanceProgram = Effect.gen(function*() {\n  // Run with increased max ops for better performance (less yielding)\n  return yield* Effect.provideService(\n    Effect.gen(function*() {\n      const maxOps = yield* MaxOpsBeforeYield\n      yield* Effect.log(`High-performance max ops: ${maxOps}`)\n\n      // Run multiple concurrent tasks\n      const tasks = Array.from(\n        { length: 100 },\n        (_, i) =>\n          Effect.gen(function*() {\n            yield* Effect.sleep(`${i * 10} millis`)\n            return `Task ${i} completed`\n          })\n      )\n\n      return yield* Effect.all(tasks, { concurrency: "unbounded" })\n    }),\n    MaxOpsBeforeYield,\n    10000\n  )\n})\n\n// Configure for fair scheduling\nconst fairSchedulingProgram = Effect.gen(function*() {\n  // Run with lower max ops for more frequent yielding\n  return yield* Effect.provideService(\n    Effect.gen(function*() {\n      const maxOps = yield* MaxOpsBeforeYield\n      yield* Effect.log(`Fair scheduling max ops: ${maxOps}`)\n\n      const longRunningTask = Effect.gen(function*() {\n        for (let i = 0; i < 1000; i++) {\n          yield* Effect.sync(() => Math.random())\n        }\n        return "Long task completed"\n      })\n\n      const quickTask = Effect.gen(function*() {\n        yield* Effect.sleep("10 millis")\n        return "Quick task completed"\n      })\n\n      // Both tasks will execute fairly due to frequent yielding\n      return yield* Effect.all([longRunningTask, quickTask], {\n        concurrency: "unbounded"\n      })\n    }),\n    MaxOpsBeforeYield,\n    50\n  )\n})';
const moduleRecord = SchedulerModule as Record<string, unknown>;

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
