/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigDecimal
 * Export: clamp
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/BigDecimal.ts
 * Generated: 2026-02-19T04:50:32.754Z
 *
 * Overview:
 * Restricts the given `BigDecimal` to be within the range specified by the `minimum` and `maximum` values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { BigDecimal } from "effect"
 * import * as assert from "node:assert"
 *
 * const clamp = BigDecimal.clamp({
 *   minimum: BigDecimal.fromStringUnsafe("1"),
 *   maximum: BigDecimal.fromStringUnsafe("5")
 * })
 *
 * assert.deepStrictEqual(
 *   clamp(BigDecimal.fromStringUnsafe("3")),
 *   BigDecimal.fromStringUnsafe("3")
 * )
 * assert.deepStrictEqual(
 *   clamp(BigDecimal.fromStringUnsafe("0")),
 *   BigDecimal.fromStringUnsafe("1")
 * )
 * assert.deepStrictEqual(
 *   clamp(BigDecimal.fromStringUnsafe("6")),
 *   BigDecimal.fromStringUnsafe("5")
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
const exportName = "clamp";
const exportKind = "const";
const moduleImportPath = "effect/BigDecimal";
const sourceSummary =
  "Restricts the given `BigDecimal` to be within the range specified by the `minimum` and `maximum` values.";
const sourceExample =
  'import { BigDecimal } from "effect"\nimport * as assert from "node:assert"\n\nconst clamp = BigDecimal.clamp({\n  minimum: BigDecimal.fromStringUnsafe("1"),\n  maximum: BigDecimal.fromStringUnsafe("5")\n})\n\nassert.deepStrictEqual(\n  clamp(BigDecimal.fromStringUnsafe("3")),\n  BigDecimal.fromStringUnsafe("3")\n)\nassert.deepStrictEqual(\n  clamp(BigDecimal.fromStringUnsafe("0")),\n  BigDecimal.fromStringUnsafe("1")\n)\nassert.deepStrictEqual(\n  clamp(BigDecimal.fromStringUnsafe("6")),\n  BigDecimal.fromStringUnsafe("5")\n)';
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
