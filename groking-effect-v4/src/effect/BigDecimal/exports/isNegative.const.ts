/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigDecimal
 * Export: isNegative
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/BigDecimal.ts
 * Generated: 2026-02-19T04:50:32.755Z
 *
 * Overview:
 * Checks if a given `BigDecimal` is negative.
 *
 * Source JSDoc Example:
 * ```ts
 * import { fromStringUnsafe, isNegative } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(isNegative(fromStringUnsafe("-1")), true)
 * assert.deepStrictEqual(isNegative(fromStringUnsafe("0")), false)
 * assert.deepStrictEqual(isNegative(fromStringUnsafe("1")), false)
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as BigDecimalModule from "effect/BigDecimal";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isNegative";
const exportKind = "const";
const moduleImportPath = "effect/BigDecimal";
const sourceSummary = "Checks if a given `BigDecimal` is negative.";
const sourceExample =
  'import { fromStringUnsafe, isNegative } from "effect/BigDecimal"\nimport * as assert from "node:assert"\n\nassert.deepStrictEqual(isNegative(fromStringUnsafe("-1")), true)\nassert.deepStrictEqual(isNegative(fromStringUnsafe("0")), false)\nassert.deepStrictEqual(isNegative(fromStringUnsafe("1")), false)';
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
