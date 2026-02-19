/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Ordering
 * Export: match
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Ordering.ts
 * Generated: 2026-02-19T04:50:38.103Z
 *
 * Overview:
 * Depending on the `Ordering` parameter given to it, returns a value produced by one of the 3 functions provided as parameters.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Ordering } from "effect"
 * import { constant } from "effect/Function"
 * import * as assert from "node:assert"
 *
 * const toMessage = Ordering.match({
 *   onLessThan: constant("less than"),
 *   onEqual: constant("equal"),
 *   onGreaterThan: constant("greater than")
 * })
 *
 * assert.deepStrictEqual(toMessage(-1), "less than")
 * assert.deepStrictEqual(toMessage(0), "equal")
 * assert.deepStrictEqual(toMessage(1), "greater than")
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
import * as OrderingModule from "effect/Ordering";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "match";
const exportKind = "const";
const moduleImportPath = "effect/Ordering";
const sourceSummary =
  "Depending on the `Ordering` parameter given to it, returns a value produced by one of the 3 functions provided as parameters.";
const sourceExample =
  'import { Ordering } from "effect"\nimport { constant } from "effect/Function"\nimport * as assert from "node:assert"\n\nconst toMessage = Ordering.match({\n  onLessThan: constant("less than"),\n  onEqual: constant("equal"),\n  onGreaterThan: constant("greater than")\n})\n\nassert.deepStrictEqual(toMessage(-1), "less than")\nassert.deepStrictEqual(toMessage(0), "equal")\nassert.deepStrictEqual(toMessage(1), "greater than")';
const moduleRecord = OrderingModule as Record<string, unknown>;

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
