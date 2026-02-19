/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RegExp
 * Export: isRegExp
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RegExp.ts
 * Generated: 2026-02-19T04:14:16.494Z
 *
 * Overview:
 * Tests if a value is a `RegExp`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { RegExp } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(RegExp.isRegExp(/a/), true)
 * assert.deepStrictEqual(RegExp.isRegExp("a"), false)
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
const exportName = "isRegExp";
const exportKind = "const";
const moduleImportPath = "effect/RegExp";
const sourceSummary = "Tests if a value is a `RegExp`.";
const sourceExample =
  'import { RegExp } from "effect"\nimport * as assert from "node:assert"\n\nassert.deepStrictEqual(RegExp.isRegExp(/a/), true)\nassert.deepStrictEqual(RegExp.isRegExp("a"), false)';
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
