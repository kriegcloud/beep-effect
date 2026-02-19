/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/FastCheck
 * Export: EntityGraphRelations
 * Kind: type
 * Source: node_modules/fast-check/lib/types/arbitrary/_internals/interfaces/EntityGraphTypes.d.ts
 * Generated: 2026-02-19T04:14:22.330Z
 *
 * Overview:
 * Defines all relationships between entity types for {@link entityGraph}.
 *
 * Source JSDoc Example:
 * ```ts
 * {
 *   employee: {
 *     manager: { arity: '0-1', type: 'employee' },
 *     team: { arity: '1', type: 'team' }
 *   },
 *   team: {}
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
import * as FastCheckModule from "effect/testing/FastCheck";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "EntityGraphRelations";
const exportKind = "type";
const moduleImportPath = "effect/testing/FastCheck";
const sourceSummary = "Defines all relationships between entity types for {@link entityGraph}.";
const sourceExample = "{\n  employee: {\n    manager: { arity: '0-1', type: 'employee' },\n    team: { arity: '1', type: 'team' }\n  },\n  team: {}\n}";
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
