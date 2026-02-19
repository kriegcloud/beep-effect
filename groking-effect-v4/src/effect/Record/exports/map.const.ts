/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Record
 * Export: map
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Record.ts
 * Generated: 2026-02-19T04:14:16.283Z
 *
 * Overview:
 * Maps a record into another record by applying a transformation function to each of its values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 * 
 * const f = (n: number) => `-${n}`
 * 
 * assert.deepStrictEqual(Record.map({ a: 3, b: 5 }, f), { a: "-3", b: "-5" })
 * 
 * const g = (n: number, key: string) => `${key.toUpperCase()}-${n}`
 * 
 * assert.deepStrictEqual(Record.map({ a: 3, b: 5 }, g), { a: "A-3", b: "B-5" })
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
const exportName = "map";
const exportKind = "const";
const moduleImportPath = "effect/Record";
const sourceSummary = "Maps a record into another record by applying a transformation function to each of its values.";
const sourceExample = "import { Record } from \"effect\"\nimport * as assert from \"node:assert\"\n\nconst f = (n: number) => `-${n}`\n\nassert.deepStrictEqual(Record.map({ a: 3, b: 5 }, f), { a: \"-3\", b: \"-5\" })\n\nconst g = (n: number, key: string) => `${key.toUpperCase()}-${n}`\n\nassert.deepStrictEqual(Record.map({ a: 3, b: 5 }, g), { a: \"A-3\", b: \"B-5\" })";
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
