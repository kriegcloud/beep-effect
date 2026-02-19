/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/String
 * Export: trimEnd
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/String.ts
 * Generated: 2026-02-19T04:50:42.516Z
 *
 * Overview:
 * Removes whitespace from the end of a string.
 *
 * Source JSDoc Example:
 * ```ts
 * import { String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(String.trimEnd(" a "), " a")
 * assert.deepStrictEqual(String.trimEnd("hello world  "), "hello world")
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
import * as StringModule from "effect/String";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "trimEnd";
const exportKind = "const";
const moduleImportPath = "effect/String";
const sourceSummary = "Removes whitespace from the end of a string.";
const sourceExample =
  'import { String } from "effect"\nimport * as assert from "node:assert"\n\nassert.deepStrictEqual(String.trimEnd(" a "), " a")\nassert.deepStrictEqual(String.trimEnd("hello world  "), "hello world")';
const moduleRecord = StringModule as Record<string, unknown>;

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
