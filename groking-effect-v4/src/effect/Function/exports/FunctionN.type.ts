/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Function
 * Export: FunctionN
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Function.ts
 * Generated: 2026-02-19T04:14:13.309Z
 *
 * Overview:
 * Represents a function with multiple arguments.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { FunctionN } from "effect/Function"
 * import * as assert from "node:assert"
 * 
 * const sum: FunctionN<[number, number], number> = (a, b) => a + b
 * assert.deepStrictEqual(sum(2, 3), 5)
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
import * as FunctionModule from "effect/Function";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "FunctionN";
const exportKind = "type";
const moduleImportPath = "effect/Function";
const sourceSummary = "Represents a function with multiple arguments.";
const sourceExample = "import type { FunctionN } from \"effect/Function\"\nimport * as assert from \"node:assert\"\n\nconst sum: FunctionN<[number, number], number> = (a, b) => a + b\nassert.deepStrictEqual(sum(2, 3), 5)";
const moduleRecord = FunctionModule as Record<string, unknown>;

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
