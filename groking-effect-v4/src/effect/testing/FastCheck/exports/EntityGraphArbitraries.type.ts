/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/FastCheck
 * Export: EntityGraphArbitraries
 * Kind: type
 * Source: node_modules/fast-check/lib/types/arbitrary/_internals/interfaces/EntityGraphTypes.d.ts
 * Generated: 2026-02-19T04:50:43.244Z
 *
 * Overview:
 * Defines all entity types and their data fields for {@link entityGraph}.
 *
 * Source JSDoc Example:
 * ```ts
 * {
 *   employee: { name: fc.string(), age: fc.nat(100) },
 *   team: { name: fc.string(), size: fc.nat(50) }
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FastCheckModule from "effect/testing/FastCheck";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "EntityGraphArbitraries";
const exportKind = "type";
const moduleImportPath = "effect/testing/FastCheck";
const sourceSummary = "Defines all entity types and their data fields for {@link entityGraph}.";
const sourceExample =
  "{\n  employee: { name: fc.string(), age: fc.nat(100) },\n  team: { name: fc.string(), size: fc.nat(50) }\n}";
const moduleRecord = FastCheckModule as Record<string, unknown>;

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
