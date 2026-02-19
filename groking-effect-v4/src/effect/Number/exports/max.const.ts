/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Number
 * Export: max
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Number.ts
 * Generated: 2026-02-19T04:14:15.367Z
 *
 * Overview:
 * Returns the maximum between two `number`s.
 *
 * Source JSDoc Example:
 * ```ts
 * import { max } from "effect/Number"
 * import * as assert from "node:assert"
 * 
 * assert.deepStrictEqual(max(2, 3), 3)
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
import * as NumberModule from "effect/Number";
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
const moduleImportPath = "effect/Number";
const sourceSummary = "Returns the maximum between two `number`s.";
const sourceExample = "import { max } from \"effect/Number\"\nimport * as assert from \"node:assert\"\n\nassert.deepStrictEqual(max(2, 3), 3)";
const moduleRecord = NumberModule as Record<string, unknown>;

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
