/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Record
 * Export: some
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Record.ts
 * Generated: 2026-02-19T04:14:16.284Z
 *
 * Overview:
 * Check if any entry in a record meets a specific condition.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 * 
 * assert.deepStrictEqual(Record.some({ a: 1, b: 2 }, (n) => n > 1), true)
 * assert.deepStrictEqual(Record.some({ a: 1, b: 2 }, (n) => n > 2), false)
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
import * as RecordModule from "effect/Record";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "some";
const exportKind = "const";
const moduleImportPath = "effect/Record";
const sourceSummary = "Check if any entry in a record meets a specific condition.";
const sourceExample = "import { Record } from \"effect\"\nimport * as assert from \"node:assert\"\n\nassert.deepStrictEqual(Record.some({ a: 1, b: 2 }, (n) => n > 1), true)\nassert.deepStrictEqual(Record.some({ a: 1, b: 2 }, (n) => n > 2), false)";
const moduleRecord = RecordModule as Record<string, unknown>;

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
