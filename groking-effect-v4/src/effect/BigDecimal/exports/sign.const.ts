/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/BigDecimal
 * Export: sign
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/BigDecimal.ts
 * Generated: 2026-02-19T04:14:09.908Z
 *
 * Overview:
 * Determines the sign of a given `BigDecimal`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { fromStringUnsafe, sign } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 * 
 * assert.deepStrictEqual(sign(fromStringUnsafe("-5")), -1)
 * assert.deepStrictEqual(sign(fromStringUnsafe("0")), 0)
 * assert.deepStrictEqual(sign(fromStringUnsafe("5")), 1)
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
const exportName = "sign";
const exportKind = "const";
const moduleImportPath = "effect/BigDecimal";
const sourceSummary = "Determines the sign of a given `BigDecimal`.";
const sourceExample = "import { fromStringUnsafe, sign } from \"effect/BigDecimal\"\nimport * as assert from \"node:assert\"\n\nassert.deepStrictEqual(sign(fromStringUnsafe(\"-5\")), -1)\nassert.deepStrictEqual(sign(fromStringUnsafe(\"0\")), 0)\nassert.deepStrictEqual(sign(fromStringUnsafe(\"5\")), 1)";
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
