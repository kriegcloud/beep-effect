/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Record
 * Export: ReadonlyRecordTypeLambda
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Record.ts
 * Generated: 2026-02-19T04:50:38.645Z
 *
 * Overview:
 * Type lambda for readonly records, used in higher-kinded type operations. This enables records to work with generic type constructors and functors.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Record } from "effect"
 *
 * // The type lambda allows records to be used as higher-kinded types
 * type RecordTypeLambda = Record.ReadonlyRecordTypeLambda<"key1" | "key2">
 *
 * // This enables mapping over the type parameter
 * type StringRecord = RecordTypeLambda["type"] // ReadonlyRecord<"key1" | "key2", Target>
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as RecordModule from "effect/Record";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ReadonlyRecordTypeLambda";
const exportKind = "interface";
const moduleImportPath = "effect/Record";
const sourceSummary =
  "Type lambda for readonly records, used in higher-kinded type operations. This enables records to work with generic type constructors and functors.";
const sourceExample =
  'import type { Record } from "effect"\n\n// The type lambda allows records to be used as higher-kinded types\ntype RecordTypeLambda = Record.ReadonlyRecordTypeLambda<"key1" | "key2">\n\n// This enables mapping over the type parameter\ntype StringRecord = RecordTypeLambda["type"] // ReadonlyRecord<"key1" | "key2", Target>';
const moduleRecord = RecordModule as Record<string, unknown>;

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
