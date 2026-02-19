/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Struct
 * Export: Simplify
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Struct.ts
 * Generated: 2026-02-19T04:14:21.492Z
 *
 * Overview:
 * Flattens intersection types into a single object type for readability.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Struct } from "effect"
 * 
 * type Original = { a: string } & { b: number }
 * 
 * // Without Simplify, the type displays as `{ a: string } & { b: number }`
 * type Simplified = Struct.Simplify<Original>
 * // { a: string; b: number }
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
import * as StructModule from "effect/Struct";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Simplify";
const exportKind = "type";
const moduleImportPath = "effect/Struct";
const sourceSummary = "Flattens intersection types into a single object type for readability.";
const sourceExample = "import type { Struct } from \"effect\"\n\ntype Original = { a: string } & { b: number }\n\n// Without Simplify, the type displays as `{ a: string } & { b: number }`\ntype Simplified = Struct.Simplify<Original>\n// { a: string; b: number }";
const moduleRecord = StructModule as Record<string, unknown>;

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
