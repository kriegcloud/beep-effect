/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Struct
 * Export: Apply
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Struct.ts
 * Generated: 2026-02-19T04:50:42.533Z
 *
 * Overview:
 * Applies a {@link Lambda} type-level function to a value type `V`, producing the output type.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Struct } from "effect"
 *
 * interface ToString extends Struct.Lambda {
 *   readonly "~lambda.out": string
 * }
 *
 * // Result is `string`
 * type Result = Struct.Apply<ToString, number>
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
import * as StructModule from "effect/Struct";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Apply";
const exportKind = "type";
const moduleImportPath = "effect/Struct";
const sourceSummary = "Applies a {@link Lambda} type-level function to a value type `V`, producing the output type.";
const sourceExample =
  'import type { Struct } from "effect"\n\ninterface ToString extends Struct.Lambda {\n  readonly "~lambda.out": string\n}\n\n// Result is `string`\ntype Result = Struct.Apply<ToString, number>';
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
