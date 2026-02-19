/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Equal
 * Export: Equal
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Equal.ts
 * Generated: 2026-02-19T04:14:12.620Z
 *
 * Overview:
 * An interface defining objects that can determine equality with other `Equal` objects. Objects implementing this interface must also implement `Hash` for consistency.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equal, Hash } from "effect"
 * 
 * class Coordinate implements Equal.Equal {
 *   constructor(readonly x: number, readonly y: number) {}
 * 
 *   [Equal.symbol](that: Equal.Equal): boolean {
 *     return that instanceof Coordinate &&
 *       this.x === that.x &&
 *       this.y === that.y
 *   }
 * 
 *   [Hash.symbol](): number {
 *     return Hash.string(`${this.x},${this.y}`)
 *   }
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
import * as EqualModule from "effect/Equal";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Equal";
const exportKind = "interface";
const moduleImportPath = "effect/Equal";
const sourceSummary = "An interface defining objects that can determine equality with other `Equal` objects. Objects implementing this interface must also implement `Hash` for consistency.";
const sourceExample = "import { Equal, Hash } from \"effect\"\n\nclass Coordinate implements Equal.Equal {\n  constructor(readonly x: number, readonly y: number) {}\n\n  [Equal.symbol](that: Equal.Equal): boolean {\n    return that instanceof Coordinate &&\n      this.x === that.x &&\n      this.y === that.y\n  }\n\n  [Hash.symbol](): number {\n    return Hash.string(`${this.x},${this.y}`)\n  }\n}";
const moduleRecord = EqualModule as Record<string, unknown>;

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
