/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Ref
 * Export: Ref
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Ref.ts
 * Generated: 2026-02-19T04:14:16.480Z
 *
 * Overview:
 * A mutable reference that provides atomic read, write, and update operations.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Ref } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create a ref with initial value
 *   const counter = yield* Ref.make(0)
 *
 *   // Read the current value
 *   const value = yield* Ref.get(counter)
 *   console.log(value) // 0
 *
 *   // Update the value atomically
 *   yield* Ref.update(counter, (n) => n + 1)
 *
 *   // Read the updated value
 *   const newValue = yield* Ref.get(counter)
 *   console.log(newValue) // 1
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
import * as RefModule from "effect/Ref";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Ref";
const exportKind = "interface";
const moduleImportPath = "effect/Ref";
const sourceSummary = "A mutable reference that provides atomic read, write, and update operations.";
const sourceExample =
  'import { Effect, Ref } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create a ref with initial value\n  const counter = yield* Ref.make(0)\n\n  // Read the current value\n  const value = yield* Ref.get(counter)\n  console.log(value) // 0\n\n  // Update the value atomically\n  yield* Ref.update(counter, (n) => n + 1)\n\n  // Read the updated value\n  const newValue = yield* Ref.get(counter)\n  console.log(newValue) // 1\n})';
const moduleRecord = RefModule as Record<string, unknown>;

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
