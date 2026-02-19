/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Record
 * Export: getSuccesses
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Record.ts
 * Generated: 2026-02-19T04:50:38.644Z
 *
 * Overview:
 * Given a record with `Result` values, returns a new record containing only the `Ok` values, preserving the original keys.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Record, Result } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   Record.getSuccesses({
 *     a: Result.succeed(1),
 *     b: Result.fail("err"),
 *     c: Result.succeed(2)
 *   }),
 *   { a: 1, c: 2 }
 * )
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
const exportName = "getSuccesses";
const exportKind = "const";
const moduleImportPath = "effect/Record";
const sourceSummary =
  "Given a record with `Result` values, returns a new record containing only the `Ok` values, preserving the original keys.";
const sourceExample =
  'import { Record, Result } from "effect"\nimport * as assert from "node:assert"\n\nassert.deepStrictEqual(\n  Record.getSuccesses({\n    a: Result.succeed(1),\n    b: Result.fail("err"),\n    c: Result.succeed(2)\n  }),\n  { a: 1, c: 2 }\n)';
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
