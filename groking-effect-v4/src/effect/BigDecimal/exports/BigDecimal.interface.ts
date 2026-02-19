/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigDecimal
 * Export: BigDecimal
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/BigDecimal.ts
 * Generated: 2026-02-19T04:14:09.907Z
 *
 * Overview:
 * Represents an arbitrary precision decimal number.
 *
 * Source JSDoc Example:
 * ```ts
 * import { BigDecimal } from "effect"
 * 
 * const d = BigDecimal.fromNumberUnsafe(123.45)
 * 
 * d.value // 12345n
 * d.scale // 2
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
import * as BigDecimalModule from "effect/BigDecimal";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "BigDecimal";
const exportKind = "interface";
const moduleImportPath = "effect/BigDecimal";
const sourceSummary = "Represents an arbitrary precision decimal number.";
const sourceExample = "import { BigDecimal } from \"effect\"\n\nconst d = BigDecimal.fromNumberUnsafe(123.45)\n\nd.value // 12345n\nd.scale // 2";
const moduleRecord = BigDecimalModule as Record<string, unknown>;

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
