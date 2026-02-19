/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigDecimal
 * Export: scale
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/BigDecimal.ts
 * Generated: 2026-02-19T04:14:09.908Z
 *
 * Overview:
 * Scales a given `BigDecimal` to the specified scale.
 *
 * Source JSDoc Example:
 * ```ts
 * import { BigDecimal } from "effect"
 * 
 * const decimal = BigDecimal.fromNumberUnsafe(123.45)
 * 
 * // Increase scale (add more precision)
 * const scaled = BigDecimal.scale(decimal, 4)
 * console.log(BigDecimal.format(scaled)) // "123.4500"
 * 
 * // Decrease scale (reduce precision, rounds down)
 * const reduced = BigDecimal.scale(decimal, 1)
 * console.log(BigDecimal.format(reduced)) // "123.4"
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as BigDecimalModule from "effect/BigDecimal";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "scale";
const exportKind = "const";
const moduleImportPath = "effect/BigDecimal";
const sourceSummary = "Scales a given `BigDecimal` to the specified scale.";
const sourceExample = "import { BigDecimal } from \"effect\"\n\nconst decimal = BigDecimal.fromNumberUnsafe(123.45)\n\n// Increase scale (add more precision)\nconst scaled = BigDecimal.scale(decimal, 4)\nconsole.log(BigDecimal.format(scaled)) // \"123.4500\"\n\n// Decrease scale (reduce precision, rounds down)\nconst reduced = BigDecimal.scale(decimal, 1)\nconsole.log(BigDecimal.format(reduced)) // \"123.4\"";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
