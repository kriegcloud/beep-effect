/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Record
 * Export: filterMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Record.ts
 * Generated: 2026-02-19T04:14:16.282Z
 *
 * Overview:
 * Transforms a record into a record by applying the function `f` to each key and value in the original record. If the function returns `Some`, the key-value pair is included in the output record.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, Record } from "effect"
 * import * as assert from "node:assert"
 * 
 * const x = { a: 1, b: 2, c: 3 }
 * const f = (a: number, key: string) => a > 2 ? Option.some(a * 2) : Option.none()
 * assert.deepStrictEqual(Record.filterMap(x, f), { c: 6 })
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
const exportName = "filterMap";
const exportKind = "const";
const moduleImportPath = "effect/Record";
const sourceSummary = "Transforms a record into a record by applying the function `f` to each key and value in the original record. If the function returns `Some`, the key-value pair is included in th...";
const sourceExample = "import { Option, Record } from \"effect\"\nimport * as assert from \"node:assert\"\n\nconst x = { a: 1, b: 2, c: 3 }\nconst f = (a: number, key: string) => a > 2 ? Option.some(a * 2) : Option.none()\nassert.deepStrictEqual(Record.filterMap(x, f), { c: 6 })";
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
