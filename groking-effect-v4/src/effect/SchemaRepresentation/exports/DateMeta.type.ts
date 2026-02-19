/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/SchemaRepresentation
 * Export: DateMeta
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/SchemaRepresentation.ts
 * Generated: 2026-02-19T04:50:40.594Z
 *
 * Overview:
 * Metadata union for Date-specific validation checks (valid, min, max, between).
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
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
import * as SchemaRepresentationModule from "effect/SchemaRepresentation";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "DateMeta";
const exportKind = "type";
const moduleImportPath = "effect/SchemaRepresentation";
const sourceSummary = "Metadata union for Date-specific validation checks (valid, min, max, between).";
const sourceExample = "";
const moduleRecord = SchemaRepresentationModule as Record<string, unknown>;

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
