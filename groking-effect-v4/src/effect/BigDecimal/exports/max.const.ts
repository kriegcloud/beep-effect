/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigDecimal
 * Export: max
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/BigDecimal.ts
 * Generated: 2026-02-19T04:14:09.908Z
 *
 * Overview:
 * Returns the maximum between two `BigDecimal`s.
 *
 * Source JSDoc Example:
 * ```ts
 * import { fromStringUnsafe, max } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 * 
 * assert.deepStrictEqual(
 *   max(fromStringUnsafe("2"), fromStringUnsafe("3")),
 *   fromStringUnsafe("3")
 * )
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
const exportName = "max";
const exportKind = "const";
const moduleImportPath = "effect/BigDecimal";
const sourceSummary = "Returns the maximum between two `BigDecimal`s.";
const sourceExample = "import { fromStringUnsafe, max } from \"effect/BigDecimal\"\nimport * as assert from \"node:assert\"\n\nassert.deepStrictEqual(\n  max(fromStringUnsafe(\"2\"), fromStringUnsafe(\"3\")),\n  fromStringUnsafe(\"3\")\n)";
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
