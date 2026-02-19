/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Boolean
 * Export: Boolean
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Boolean.ts
 * Generated: 2026-02-19T04:14:10.094Z
 *
 * Overview:
 * Reference to the global Boolean constructor.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Boolean from "effect/Boolean"
 *
 * const bool = Boolean.Boolean(1)
 * console.log(bool) // true
 *
 * const fromString = Boolean.Boolean("false")
 * console.log(fromString) // true (non-empty string)
 *
 * const fromZero = Boolean.Boolean(0)
 * console.log(fromZero) // false
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
import * as BooleanModule from "effect/Boolean";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Boolean";
const exportKind = "const";
const moduleImportPath = "effect/Boolean";
const sourceSummary = "Reference to the global Boolean constructor.";
const sourceExample =
  'import * as Boolean from "effect/Boolean"\n\nconst bool = Boolean.Boolean(1)\nconsole.log(bool) // true\n\nconst fromString = Boolean.Boolean("false")\nconsole.log(fromString) // true (non-empty string)\n\nconst fromZero = Boolean.Boolean(0)\nconsole.log(fromZero) // false';
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
