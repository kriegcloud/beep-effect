/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxQueue
 * Export: State
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/TxQueue.ts
 * Generated: 2026-02-19T04:14:23.324Z
 *
 * Overview:
 * Represents the state of a transactional queue with sophisticated lifecycle management.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { TxQueue } from "effect"
 * 
 * // State progression example
 * declare const state: TxQueue.State<string, Error>
 * 
 * if (state._tag === "Open") {
 *   console.log("Queue is accepting new items")
 * } else if (state._tag === "Closing") {
 *   console.log("Queue is draining, cause:", state.cause)
 * } else {
 *   console.log("Queue is done, cause:", state.cause)
 * }
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
import * as TxQueueModule from "effect/TxQueue";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "State";
const exportKind = "type";
const moduleImportPath = "effect/TxQueue";
const sourceSummary = "Represents the state of a transactional queue with sophisticated lifecycle management.";
const sourceExample = "import type { TxQueue } from \"effect\"\n\n// State progression example\ndeclare const state: TxQueue.State<string, Error>\n\nif (state._tag === \"Open\") {\n  console.log(\"Queue is accepting new items\")\n} else if (state._tag === \"Closing\") {\n  console.log(\"Queue is draining, cause:\", state.cause)\n} else {\n  console.log(\"Queue is done, cause:\", state.cause)\n}";
const moduleRecord = TxQueueModule as Record<string, unknown>;

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
