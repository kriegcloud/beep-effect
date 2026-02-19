/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: findFirst
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:50:44.016Z
 *
 * Overview:
 * Finds the first entry in the TxHashMap that matches the given predicate. Returns the key-value pair as a tuple wrapped in an Option.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create a task priority map
 *   const tasks = yield* TxHashMap.make(
 *     ["task1", { priority: 1, assignee: "alice", completed: false }],
 *     ["task2", { priority: 3, assignee: "bob", completed: true }],
 *     ["task3", { priority: 2, assignee: "alice", completed: false }]
 *   )
 *
 *   // Find first high-priority incomplete task
 *   const highPriorityTask = yield* TxHashMap.findFirst(
 *     tasks,
 *     (task) => task.priority >= 2 && !task.completed
 *   )
 *
 *   if (highPriorityTask) {
 *     const [taskId, task] = highPriorityTask
 *     console.log(`Found task: ${taskId}, priority: ${task.priority}`)
 *     // "Found task: task3, priority: 2"
 *   }
 *
 *   // Find first task assigned to specific user
 *   const aliceTask = yield* tasks.pipe(
 *     TxHashMap.findFirst((task) => task.assignee === "alice")
 *   )
 *
 *   if (aliceTask) {
 *     console.log(`Alice's task: ${aliceTask[0]}`)
 *   }
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
import * as TxHashMapModule from "effect/TxHashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "findFirst";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary =
  "Finds the first entry in the TxHashMap that matches the given predicate. Returns the key-value pair as a tuple wrapped in an Option.";
const sourceExample =
  'import { Effect, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create a task priority map\n  const tasks = yield* TxHashMap.make(\n    ["task1", { priority: 1, assignee: "alice", completed: false }],\n    ["task2", { priority: 3, assignee: "bob", completed: true }],\n    ["task3", { priority: 2, assignee: "alice", completed: false }]\n  )\n\n  // Find first high-priority incomplete task\n  const highPriorityTask = yield* TxHashMap.findFirst(\n    tasks,\n    (task) => task.priority >= 2 && !task.completed\n  )\n\n  if (highPriorityTask) {\n    const [taskId, task] = highPriorityTask\n    console.log(`Found task: ${taskId}, priority: ${task.priority}`)\n    // "Found task: task3, priority: 2"\n  }\n\n  // Find first task assigned to specific user\n  const aliceTask = yield* tasks.pipe(\n    TxHashMap.findFirst((task) => task.assignee === "alice")\n  )\n\n  if (aliceTask) {\n    console.log(`Alice\'s task: ${aliceTask[0]}`)\n  }\n})';
const moduleRecord = TxHashMapModule as Record<string, unknown>;

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
