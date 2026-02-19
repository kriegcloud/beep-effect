/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RegExp
 * Export: escape
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RegExp.ts
 * Generated: 2026-02-19T04:14:16.494Z
 *
 * Overview:
 * Escapes special characters in a regular expression pattern.
 *
 * Source JSDoc Example:
 * ```ts
 * import { RegExp } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(RegExp.escape("a*b"), "a\\*b")
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
import * as RegExpModule from "effect/RegExp";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "escape";
const exportKind = "const";
const moduleImportPath = "effect/RegExp";
const sourceSummary = "Escapes special characters in a regular expression pattern.";
const sourceExample =
  'import { RegExp } from "effect"\nimport * as assert from "node:assert"\n\nassert.deepStrictEqual(RegExp.escape("a*b"), "a\\\\*b")';
const moduleRecord = RegExpModule as Record<string, unknown>;

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
