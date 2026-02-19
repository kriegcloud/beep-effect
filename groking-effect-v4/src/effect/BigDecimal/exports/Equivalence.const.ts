/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigDecimal
 * Export: Equivalence
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/BigDecimal.ts
 * Generated: 2026-02-19T04:50:32.755Z
 *
 * Overview:
 * Provides an `Equivalence` instance for `BigDecimal` that determines equality between BigDecimal values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { BigDecimal } from "effect"
 *
 * const a = BigDecimal.fromNumberUnsafe(1.50)
 * const b = BigDecimal.fromNumberUnsafe(1.5)
 * const c = BigDecimal.fromNumberUnsafe(2.0)
 *
 * console.log(BigDecimal.Equivalence(a, b)) // true (1.50 === 1.5)
 * console.log(BigDecimal.Equivalence(a, c)) // false (1.50 !== 2.0)
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
const exportName = "Equivalence";
const exportKind = "const";
const moduleImportPath = "effect/BigDecimal";
const sourceSummary =
  "Provides an `Equivalence` instance for `BigDecimal` that determines equality between BigDecimal values.";
const sourceExample =
  'import { BigDecimal } from "effect"\n\nconst a = BigDecimal.fromNumberUnsafe(1.50)\nconst b = BigDecimal.fromNumberUnsafe(1.5)\nconst c = BigDecimal.fromNumberUnsafe(2.0)\n\nconsole.log(BigDecimal.Equivalence(a, b)) // true (1.50 === 1.5)\nconsole.log(BigDecimal.Equivalence(a, c)) // false (1.50 !== 2.0)';
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
