/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Number
 * Export: isLessThanOrEqualTo
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Number.ts
 * Generated: 2026-02-19T04:14:15.367Z
 *
 * Overview:
 * Returns a function that checks if a given `number` is less than or equal to the provided one.
 *
 * Source JSDoc Example:
 * ```ts
 * import { isLessThanOrEqualTo } from "effect/Number"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(isLessThanOrEqualTo(2, 3), true)
 * assert.deepStrictEqual(isLessThanOrEqualTo(3, 3), true)
 * assert.deepStrictEqual(isLessThanOrEqualTo(4, 3), false)
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
import * as NumberModule from "effect/Number";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isLessThanOrEqualTo";
const exportKind = "const";
const moduleImportPath = "effect/Number";
const sourceSummary = "Returns a function that checks if a given `number` is less than or equal to the provided one.";
const sourceExample =
  'import { isLessThanOrEqualTo } from "effect/Number"\nimport * as assert from "node:assert"\n\nassert.deepStrictEqual(isLessThanOrEqualTo(2, 3), true)\nassert.deepStrictEqual(isLessThanOrEqualTo(3, 3), true)\nassert.deepStrictEqual(isLessThanOrEqualTo(4, 3), false)';
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
