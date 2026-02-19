/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/String
 * Export: toLowerCase
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/String.ts
 * Generated: 2026-02-19T04:14:21.473Z
 *
 * Overview:
 * Converts a string to lowercase.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(pipe("A", String.toLowerCase), "a")
 * assert.deepStrictEqual(String.toLowerCase("HELLO"), "hello")
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
import * as StringModule from "effect/String";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toLowerCase";
const exportKind = "const";
const moduleImportPath = "effect/String";
const sourceSummary = "Converts a string to lowercase.";
const sourceExample =
  'import { pipe, String } from "effect"\nimport * as assert from "node:assert"\n\nassert.deepStrictEqual(pipe("A", String.toLowerCase), "a")\nassert.deepStrictEqual(String.toLowerCase("HELLO"), "hello")';
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
