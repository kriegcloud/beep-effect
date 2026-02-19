/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigDecimal
 * Export: ceil
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/BigDecimal.ts
 * Generated: 2026-02-19T04:14:09.907Z
 *
 * Overview:
 * Calculate the ceiling of a `BigDecimal` at the given scale.
 *
 * Source JSDoc Example:
 * ```ts
 * import { ceil, fromStringUnsafe } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   ceil(fromStringUnsafe("145"), -1),
 *   fromStringUnsafe("150")
 * )
 * assert.deepStrictEqual(ceil(fromStringUnsafe("-14.5")), fromStringUnsafe("-14"))
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as BigDecimalModule from "effect/BigDecimal";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ceil";
const exportKind = "const";
const moduleImportPath = "effect/BigDecimal";
const sourceSummary = "Calculate the ceiling of a `BigDecimal` at the given scale.";
const sourceExample =
  'import { ceil, fromStringUnsafe } from "effect/BigDecimal"\nimport * as assert from "node:assert"\n\nassert.deepStrictEqual(\n  ceil(fromStringUnsafe("145"), -1),\n  fromStringUnsafe("150")\n)\nassert.deepStrictEqual(ceil(fromStringUnsafe("-14.5")), fromStringUnsafe("-14"))';
const moduleRecord = BigDecimalModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
