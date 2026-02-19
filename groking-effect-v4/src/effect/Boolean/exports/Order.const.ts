/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Boolean
 * Export: Order
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Boolean.ts
 * Generated: 2026-02-19T04:50:32.945Z
 *
 * Overview:
 * Provides an `Order` instance for `boolean` that allows comparing and sorting boolean values. In this ordering, `false` is considered less than `true`.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Boolean from "effect/Boolean"
 *
 * console.log(Boolean.Order(false, true)) // -1 (false < true)
 * console.log(Boolean.Order(true, false)) // 1 (true > false)
 * console.log(Boolean.Order(true, true)) // 0 (true === true)
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
import * as BooleanModule from "effect/Boolean";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Order";
const exportKind = "const";
const moduleImportPath = "effect/Boolean";
const sourceSummary =
  "Provides an `Order` instance for `boolean` that allows comparing and sorting boolean values. In this ordering, `false` is considered less than `true`.";
const sourceExample =
  'import * as Boolean from "effect/Boolean"\n\nconsole.log(Boolean.Order(false, true)) // -1 (false < true)\nconsole.log(Boolean.Order(true, false)) // 1 (true > false)\nconsole.log(Boolean.Order(true, true)) // 0 (true === true)';
const moduleRecord = BooleanModule as Record<string, unknown>;

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
