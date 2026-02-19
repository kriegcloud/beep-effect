/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Function
 * Export: untupled
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Function.ts
 * Generated: 2026-02-19T04:14:13.309Z
 *
 * Overview:
 * Inverse function of `tupled`
 *
 * Source JSDoc Example:
 * ```ts
 * import { untupled } from "effect/Function"
 * import * as assert from "node:assert"
 *
 * const getFirst = untupled(<A, B>(tuple: [A, B]): A => tuple[0])
 *
 * assert.deepStrictEqual(getFirst(1, 2), 1)
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
import * as FunctionModule from "effect/Function";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "untupled";
const exportKind = "const";
const moduleImportPath = "effect/Function";
const sourceSummary = "Inverse function of `tupled`";
const sourceExample =
  'import { untupled } from "effect/Function"\nimport * as assert from "node:assert"\n\nconst getFirst = untupled(<A, B>(tuple: [A, B]): A => tuple[0])\n\nassert.deepStrictEqual(getFirst(1, 2), 1)';
const moduleRecord = FunctionModule as Record<string, unknown>;

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
