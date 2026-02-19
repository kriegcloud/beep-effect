/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Function
 * Export: satisfies
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Function.ts
 * Generated: 2026-02-19T04:50:36.535Z
 *
 * Overview:
 * A function that ensures that the type of an expression matches some type, without changing the resulting type of that expression.
 *
 * Source JSDoc Example:
 * ```ts
 * import { satisfies } from "effect/Function"
 * import * as assert from "node:assert"
 *
 * const test1 = satisfies<number>()(5 as const)
 * // ^? const test: 5
 * // @ts-expect-error
 * const test2 = satisfies<string>()(5)
 * // ^? Argument of type 'number' is not assignable to parameter of type 'string'
 *
 * assert.deepStrictEqual(satisfies<number>()(5), 5)
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
import * as FunctionModule from "effect/Function";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "satisfies";
const exportKind = "const";
const moduleImportPath = "effect/Function";
const sourceSummary =
  "A function that ensures that the type of an expression matches some type, without changing the resulting type of that expression.";
const sourceExample =
  "import { satisfies } from \"effect/Function\"\nimport * as assert from \"node:assert\"\n\nconst test1 = satisfies<number>()(5 as const)\n// ^? const test: 5\n// @ts-expect-error\nconst test2 = satisfies<string>()(5)\n// ^? Argument of type 'number' is not assignable to parameter of type 'string'\n\nassert.deepStrictEqual(satisfies<number>()(5), 5)";
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
