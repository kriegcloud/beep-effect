/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Record
 * Export: replace
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Record.ts
 * Generated: 2026-02-19T04:14:16.284Z
 *
 * Overview:
 * Replaces a value in the record with the new value passed as parameter.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Record } from "effect"
 *
 * Record.replace({ a: 1, b: 2, c: 3 }, "a", 10) // { a: 10, b: 2, c: 3 }
 * Record.replace(Record.empty<string>(), "a", 10) // undefined
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as RecordModule from "effect/Record";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "replace";
const exportKind = "const";
const moduleImportPath = "effect/Record";
const sourceSummary = "Replaces a value in the record with the new value passed as parameter.";
const sourceExample =
  'import { Record } from "effect"\n\nRecord.replace({ a: 1, b: 2, c: 3 }, "a", 10) // { a: 10, b: 2, c: 3 }\nRecord.replace(Record.empty<string>(), "a", 10) // undefined';
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
