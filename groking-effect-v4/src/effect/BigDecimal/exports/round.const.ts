/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigDecimal
 * Export: round
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/BigDecimal.ts
 * Generated: 2026-02-19T04:50:32.757Z
 *
 * Overview:
 * Rounds a `BigDecimal` at the given scale with the specified rounding mode.
 *
 * Source JSDoc Example:
 * ```ts
 * import { fromStringUnsafe, round } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   round(fromStringUnsafe("145"), { mode: "from-zero", scale: -1 }),
 *   fromStringUnsafe("150")
 * )
 * assert.deepStrictEqual(
 *   round(fromStringUnsafe("-14.5")),
 *   fromStringUnsafe("-15")
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
const exportName = "round";
const exportKind = "const";
const moduleImportPath = "effect/BigDecimal";
const sourceSummary = "Rounds a `BigDecimal` at the given scale with the specified rounding mode.";
const sourceExample =
  'import { fromStringUnsafe, round } from "effect/BigDecimal"\nimport * as assert from "node:assert"\n\nassert.deepStrictEqual(\n  round(fromStringUnsafe("145"), { mode: "from-zero", scale: -1 }),\n  fromStringUnsafe("150")\n)\nassert.deepStrictEqual(\n  round(fromStringUnsafe("-14.5")),\n  fromStringUnsafe("-15")\n)';
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
