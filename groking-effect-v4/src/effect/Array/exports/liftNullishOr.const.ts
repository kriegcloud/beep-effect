/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: liftNullishOr
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:14:09.704Z
 *
 * Overview:
 * Lifts a nullable-returning function into one that returns an array: `null`/`undefined` becomes `[]`, anything else becomes `[value]`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const parseNumber = Array.liftNullishOr((s: string) => {
 *   const n = Number(s)
 *   return isNaN(n) ? null : n
 * })
 * console.log(parseNumber("123")) // [123]
 * console.log(parseNumber("abc")) // []
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
import * as ArrayModule from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "liftNullishOr";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Lifts a nullable-returning function into one that returns an array: `null`/`undefined` becomes `[]`, anything else becomes `[value]`.";
const sourceExample =
  'import { Array } from "effect"\n\nconst parseNumber = Array.liftNullishOr((s: string) => {\n  const n = Number(s)\n  return isNaN(n) ? null : n\n})\nconsole.log(parseNumber("123")) // [123]\nconsole.log(parseNumber("abc")) // []';
const moduleRecord = ArrayModule as Record<string, unknown>;

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
