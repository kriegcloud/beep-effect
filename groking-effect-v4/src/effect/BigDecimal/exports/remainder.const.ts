/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigDecimal
 * Export: remainder
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/BigDecimal.ts
 * Generated: 2026-02-19T04:50:32.757Z
 *
 * Overview:
 * Returns the remainder left over when one operand is divided by a second operand.
 *
 * Source JSDoc Example:
 * ```ts
 * import { BigDecimal } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   BigDecimal.remainder(
 *     BigDecimal.fromStringUnsafe("2"),
 *     BigDecimal.fromStringUnsafe("2")
 *   ),
 *   BigDecimal.fromStringUnsafe("0")
 * )
 * assert.deepStrictEqual(
 *   BigDecimal.remainder(
 *     BigDecimal.fromStringUnsafe("3"),
 *     BigDecimal.fromStringUnsafe("2")
 *   ),
 *   BigDecimal.fromStringUnsafe("1")
 * )
 * assert.deepStrictEqual(
 *   BigDecimal.remainder(
 *     BigDecimal.fromStringUnsafe("-4"),
 *     BigDecimal.fromStringUnsafe("2")
 *   ),
 *   BigDecimal.fromStringUnsafe("0")
 * )
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
const exportName = "remainder";
const exportKind = "const";
const moduleImportPath = "effect/BigDecimal";
const sourceSummary = "Returns the remainder left over when one operand is divided by a second operand.";
const sourceExample =
  'import { BigDecimal } from "effect"\nimport * as assert from "node:assert"\n\nassert.deepStrictEqual(\n  BigDecimal.remainder(\n    BigDecimal.fromStringUnsafe("2"),\n    BigDecimal.fromStringUnsafe("2")\n  ),\n  BigDecimal.fromStringUnsafe("0")\n)\nassert.deepStrictEqual(\n  BigDecimal.remainder(\n    BigDecimal.fromStringUnsafe("3"),\n    BigDecimal.fromStringUnsafe("2")\n  ),\n  BigDecimal.fromStringUnsafe("1")\n)\nassert.deepStrictEqual(\n  BigDecimal.remainder(\n    BigDecimal.fromStringUnsafe("-4"),\n    BigDecimal.fromStringUnsafe("2")\n  ),\n  BigDecimal.fromStringUnsafe("0")\n)';
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
