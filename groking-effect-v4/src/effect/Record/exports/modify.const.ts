/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Record
 * Export: modify
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Record.ts
 * Generated: 2026-02-19T04:50:38.645Z
 *
 * Overview:
 * Apply a function to the element at the specified key, creating a new record, or return `undefined` if the key doesn't exist.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Record } from "effect"
 *
 * const f = (x: number) => x * 2
 *
 * const input: Record<string, number> = { a: 3 }
 *
 * Record.modify(input, "a", f) // { a: 6 }
 * Record.modify(input, "b", f) // undefined
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
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as RecordModule from "effect/Record";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "modify";
const exportKind = "const";
const moduleImportPath = "effect/Record";
const sourceSummary =
  "Apply a function to the element at the specified key, creating a new record, or return `undefined` if the key doesn't exist.";
const sourceExample =
  'import { Record } from "effect"\n\nconst f = (x: number) => x * 2\n\nconst input: Record<string, number> = { a: 3 }\n\nRecord.modify(input, "a", f) // { a: 6 }\nRecord.modify(input, "b", f) // undefined';
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
