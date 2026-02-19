/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Struct
 * Export: Lambda
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Struct.ts
 * Generated: 2026-02-19T04:14:21.491Z
 *
 * Overview:
 * Interface for type-level functions used by {@link map}, {@link mapPick}, and {@link mapOmit}.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Struct } from "effect"
 *
 * interface ToString extends Struct.Lambda {
 *   readonly "~lambda.out": string
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as StructModule from "effect/Struct";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Lambda";
const exportKind = "interface";
const moduleImportPath = "effect/Struct";
const sourceSummary = "Interface for type-level functions used by {@link map}, {@link mapPick}, and {@link mapOmit}.";
const sourceExample =
  'import type { Struct } from "effect"\n\ninterface ToString extends Struct.Lambda {\n  readonly "~lambda.out": string\n}';
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
