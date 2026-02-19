/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Hash
 * Export: Hash
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Hash.ts
 * Generated: 2026-02-19T04:14:13.635Z
 *
 * Overview:
 * A type that represents an object that can be hashed.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Hash } from "effect"
 * 
 * class MyClass implements Hash.Hash {
 *   constructor(private value: number) {}
 * 
 *   [Hash.symbol](): number {
 *     return Hash.hash(this.value)
 *   }
 * }
 * 
 * const instance = new MyClass(42)
 * console.log(instance[Hash.symbol]()) // hash value of 42
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
import * as HashModule from "effect/Hash";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Hash";
const exportKind = "interface";
const moduleImportPath = "effect/Hash";
const sourceSummary = "A type that represents an object that can be hashed.";
const sourceExample = "import { Hash } from \"effect\"\n\nclass MyClass implements Hash.Hash {\n  constructor(private value: number) {}\n\n  [Hash.symbol](): number {\n    return Hash.hash(this.value)\n  }\n}\n\nconst instance = new MyClass(42)\nconsole.log(instance[Hash.symbol]()) // hash value of 42";
const moduleRecord = HashModule as Record<string, unknown>;

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
