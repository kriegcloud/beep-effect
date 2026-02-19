/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Number
 * Export: isGreaterThan
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Number.ts
 * Generated: 2026-02-19T04:50:37.938Z
 *
 * Overview:
 * Returns `true` if the first argument is greater than the second, otherwise `false`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { isGreaterThan } from "effect/Number"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(isGreaterThan(2, 3), false)
 * assert.deepStrictEqual(isGreaterThan(3, 3), false)
 * assert.deepStrictEqual(isGreaterThan(4, 3), true)
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
import * as NumberModule from "effect/Number";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isGreaterThan";
const exportKind = "const";
const moduleImportPath = "effect/Number";
const sourceSummary = "Returns `true` if the first argument is greater than the second, otherwise `false`.";
const sourceExample =
  'import { isGreaterThan } from "effect/Number"\nimport * as assert from "node:assert"\n\nassert.deepStrictEqual(isGreaterThan(2, 3), false)\nassert.deepStrictEqual(isGreaterThan(3, 3), false)\nassert.deepStrictEqual(isGreaterThan(4, 3), true)';
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
