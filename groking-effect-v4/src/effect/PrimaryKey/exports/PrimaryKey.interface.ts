/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PrimaryKey
 * Export: PrimaryKey
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/PrimaryKey.ts
 * Generated: 2026-02-19T04:14:15.918Z
 *
 * Overview:
 * An interface for objects that can provide a string-based primary key.
 *
 * Source JSDoc Example:
 * ```ts
 * import { PrimaryKey } from "effect"
 *
 * class ProductId implements PrimaryKey.PrimaryKey {
 *   constructor(private category: string, private id: number) {}
 *
 *   [PrimaryKey.symbol](): string {
 *     return `${this.category}-${this.id}`
 *   }
 * }
 *
 * const productId = new ProductId("electronics", 42)
 * console.log(PrimaryKey.value(productId)) // "electronics-42"
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
import * as PrimaryKeyModule from "effect/PrimaryKey";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "PrimaryKey";
const exportKind = "interface";
const moduleImportPath = "effect/PrimaryKey";
const sourceSummary = "An interface for objects that can provide a string-based primary key.";
const sourceExample =
  'import { PrimaryKey } from "effect"\n\nclass ProductId implements PrimaryKey.PrimaryKey {\n  constructor(private category: string, private id: number) {}\n\n  [PrimaryKey.symbol](): string {\n    return `${this.category}-${this.id}`\n  }\n}\n\nconst productId = new ProductId("electronics", 42)\nconsole.log(PrimaryKey.value(productId)) // "electronics-42"';
const moduleRecord = PrimaryKeyModule as Record<string, unknown>;

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
