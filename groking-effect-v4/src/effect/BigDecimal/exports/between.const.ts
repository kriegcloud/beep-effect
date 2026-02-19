/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigDecimal
 * Export: between
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/BigDecimal.ts
 * Generated: 2026-02-19T04:14:09.907Z
 *
 * Overview:
 * Checks if a `BigDecimal` is between a `minimum` and `maximum` value (inclusive).
 *
 * Source JSDoc Example:
 * ```ts
 * import { BigDecimal } from "effect"
 * import * as assert from "node:assert"
 *
 * const between = BigDecimal.between({
 *   minimum: BigDecimal.fromStringUnsafe("1"),
 *   maximum: BigDecimal.fromStringUnsafe("5")
 * })
 *
 * assert.deepStrictEqual(between(BigDecimal.fromStringUnsafe("3")), true)
 * assert.deepStrictEqual(between(BigDecimal.fromStringUnsafe("0")), false)
 * assert.deepStrictEqual(between(BigDecimal.fromStringUnsafe("6")), false)
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
const exportName = "between";
const exportKind = "const";
const moduleImportPath = "effect/BigDecimal";
const sourceSummary = "Checks if a `BigDecimal` is between a `minimum` and `maximum` value (inclusive).";
const sourceExample =
  'import { BigDecimal } from "effect"\nimport * as assert from "node:assert"\n\nconst between = BigDecimal.between({\n  minimum: BigDecimal.fromStringUnsafe("1"),\n  maximum: BigDecimal.fromStringUnsafe("5")\n})\n\nassert.deepStrictEqual(between(BigDecimal.fromStringUnsafe("3")), true)\nassert.deepStrictEqual(between(BigDecimal.fromStringUnsafe("0")), false)\nassert.deepStrictEqual(between(BigDecimal.fromStringUnsafe("6")), false)';
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
