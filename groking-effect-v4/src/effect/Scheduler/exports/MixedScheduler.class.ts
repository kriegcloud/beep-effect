/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Scheduler
 * Export: MixedScheduler
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/Scheduler.ts
 * Generated: 2026-02-19T04:14:17.063Z
 *
 * Overview:
 * A scheduler implementation that provides efficient task scheduling with support for both synchronous and asynchronous execution modes.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MixedScheduler } from "effect/Scheduler"
 * 
 * // Create a mixed scheduler with async execution (default)
 * const asyncScheduler = new MixedScheduler("async")
 * 
 * // Create a mixed scheduler with sync execution
 * const syncScheduler = new MixedScheduler("sync")
 * 
 * // Schedule tasks with different priorities
 * asyncScheduler.scheduleTask(() => console.log("High priority task"), 10)
 * asyncScheduler.scheduleTask(() => console.log("Normal priority task"), 0)
 * asyncScheduler.scheduleTask(() => console.log("Low priority task"), -1)
 * 
 * // For sync scheduler, you can flush tasks immediately
 * syncScheduler.scheduleTask(() => console.log("Task 1"), 0)
 * syncScheduler.scheduleTask(() => console.log("Task 2"), 0)
 * 
 * // Force flush all pending tasks in sync mode
 * syncScheduler.flush()
 * // Output: "Task 1", "Task 2"
 * 
 * // Check execution mode
 * console.log(asyncScheduler.executionMode) // "async"
 * console.log(syncScheduler.executionMode) // "sync"
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as SchedulerModule from "effect/Scheduler";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "MixedScheduler";
const exportKind = "class";
const moduleImportPath = "effect/Scheduler";
const sourceSummary = "A scheduler implementation that provides efficient task scheduling with support for both synchronous and asynchronous execution modes.";
const sourceExample = "import { MixedScheduler } from \"effect/Scheduler\"\n\n// Create a mixed scheduler with async execution (default)\nconst asyncScheduler = new MixedScheduler(\"async\")\n\n// Create a mixed scheduler with sync execution\nconst syncScheduler = new MixedScheduler(\"sync\")\n\n// Schedule tasks with different priorities\nasyncScheduler.scheduleTask(() => console.log(\"High priority task\"), 10)\nasyncScheduler.scheduleTask(() => console.log(\"Normal priority task\"), 0)\nasyncScheduler.scheduleTask(() => console.log(\"Low priority task\"), -1)\n\n// For sync scheduler, you can flush tasks immediately\nsyncScheduler.scheduleTask(() => console.log(\"Task 1\"), 0)\nsyncScheduler.scheduleTask(() => console.log(\"Task 2\"), 0)\n\n// Force flush all pending tasks in sync mode\nsyncScheduler.flush()\n// Output: \"Task 1\", \"Task 2\"\n\n// Check execution mode\nconsole.log(asyncScheduler.executionMode) // \"async\"\nconsole.log(syncScheduler.executionMode) // \"sync\"";
const moduleRecord = SchedulerModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleClassDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata and class-like surface information.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleConstructionProbe = Effect.gen(function* () {
  yield* Console.log("Attempt a zero-arg construction probe.");
  yield* probeNamedExportConstructor({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧱",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Class Discovery",
      description: "Inspect runtime shape and discover class metadata.",
      run: exampleClassDiscovery
    },
    {
      title: "Zero-Arg Construction Probe",
      description: "Attempt construction and report constructor behavior.",
      run: exampleConstructionProbe
    }
  ]
});

BunRuntime.runMain(program);
