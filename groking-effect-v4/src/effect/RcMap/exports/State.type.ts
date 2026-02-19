/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RcMap
 * Export: State
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/RcMap.ts
 * Generated: 2026-02-19T04:14:16.239Z
 *
 * Overview:
 * Represents the internal state of an RcMap, which can be either Open (active) or Closed (shutdown and no longer accepting operations).
 *
 * Source JSDoc Example:
 * ```ts
 * import type { RcMap } from "effect"
 *
 * // State is a union type that can be either:
 * declare const openState: RcMap.State.Open<string, number, never>
 * declare const closedState: RcMap.State.Closed
 *
 * // Check the state type
 * declare const state: RcMap.State<string, number, never>
 * if (state._tag === "Open") {
 *   // Access the internal map when open
 *   console.log("Map is open, contains entries")
 * } else {
 *   // State is closed
 *   console.log("Map is closed")
 * }
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
import * as RcMapModule from "effect/RcMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "State";
const exportKind = "type";
const moduleImportPath = "effect/RcMap";
const sourceSummary =
  "Represents the internal state of an RcMap, which can be either Open (active) or Closed (shutdown and no longer accepting operations).";
const sourceExample =
  'import type { RcMap } from "effect"\n\n// State is a union type that can be either:\ndeclare const openState: RcMap.State.Open<string, number, never>\ndeclare const closedState: RcMap.State.Closed\n\n// Check the state type\ndeclare const state: RcMap.State<string, number, never>\nif (state._tag === "Open") {\n  // Access the internal map when open\n  console.log("Map is open, contains entries")\n} else {\n  // State is closed\n  console.log("Map is closed")\n}';
const moduleRecord = RcMapModule as Record<string, unknown>;

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
