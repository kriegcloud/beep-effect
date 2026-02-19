/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Number
 * Export: isGreaterThanOrEqualTo
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Number.ts
 * Generated: 2026-02-19T04:50:37.938Z
 *
 * Overview:
 * Returns a function that checks if a given `number` is greater than or equal to the provided one.
 *
 * Source JSDoc Example:
 * ```ts
 * import { isGreaterThanOrEqualTo } from "effect/Number"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(isGreaterThanOrEqualTo(2, 3), false)
 * assert.deepStrictEqual(isGreaterThanOrEqualTo(3, 3), true)
 * assert.deepStrictEqual(isGreaterThanOrEqualTo(4, 3), true)
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
const exportName = "isGreaterThanOrEqualTo";
const exportKind = "const";
const moduleImportPath = "effect/Number";
const sourceSummary =
  "Returns a function that checks if a given `number` is greater than or equal to the provided one.";
const sourceExample =
  'import { isGreaterThanOrEqualTo } from "effect/Number"\nimport * as assert from "node:assert"\n\nassert.deepStrictEqual(isGreaterThanOrEqualTo(2, 3), false)\nassert.deepStrictEqual(isGreaterThanOrEqualTo(3, 3), true)\nassert.deepStrictEqual(isGreaterThanOrEqualTo(4, 3), true)';
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
