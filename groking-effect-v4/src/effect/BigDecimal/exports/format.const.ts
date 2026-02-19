/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigDecimal
 * Export: format
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/BigDecimal.ts
 * Generated: 2026-02-19T04:50:32.755Z
 *
 * Overview:
 * Formats a given `BigDecimal` as a `string`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { format, fromStringUnsafe } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(format(fromStringUnsafe("-5")), "-5")
 * assert.deepStrictEqual(format(fromStringUnsafe("123.456")), "123.456")
 * assert.deepStrictEqual(format(fromStringUnsafe("-0.00000123")), "-0.00000123")
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
const exportName = "format";
const exportKind = "const";
const moduleImportPath = "effect/BigDecimal";
const sourceSummary = "Formats a given `BigDecimal` as a `string`.";
const sourceExample =
  'import { format, fromStringUnsafe } from "effect/BigDecimal"\nimport * as assert from "node:assert"\n\nassert.deepStrictEqual(format(fromStringUnsafe("-5")), "-5")\nassert.deepStrictEqual(format(fromStringUnsafe("123.456")), "123.456")\nassert.deepStrictEqual(format(fromStringUnsafe("-0.00000123")), "-0.00000123")';
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
