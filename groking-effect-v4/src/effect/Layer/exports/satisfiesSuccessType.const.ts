/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Layer
 * Export: satisfiesSuccessType
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Layer.ts
 * Generated: 2026-02-19T04:50:37.315Z
 *
 * Overview:
 * Ensures that an layer's success type extends a given type `ROut`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Layer } from "effect"
 *
 * declare const FortyTwoLayer: Layer.Layer<42, never, never>
 * declare const StringLayer: Layer.Layer<string, never, never>
 *
 * // Define a constraint that the success type must be a number
 * const satisfiesNumber = Layer.satisfiesSuccessType<number>()
 *
 * // This works - Layer<42, never, never> extends Layer<number, never, never>
 * const validLayer = satisfiesNumber(FortyTwoLayer)
 *
 * // This would cause a TypeScript compilation error:
 * // const invalidLayer = satisfiesNumber(StringLayer)
 * //                                     ^^^^^^^^^^^
 * // Type 'number' is not assignable to type 'string'
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
import * as LayerModule from "effect/Layer";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "satisfiesSuccessType";
const exportKind = "const";
const moduleImportPath = "effect/Layer";
const sourceSummary = "Ensures that an layer's success type extends a given type `ROut`.";
const sourceExample =
  "import { Layer } from \"effect\"\n\ndeclare const FortyTwoLayer: Layer.Layer<42, never, never>\ndeclare const StringLayer: Layer.Layer<string, never, never>\n\n// Define a constraint that the success type must be a number\nconst satisfiesNumber = Layer.satisfiesSuccessType<number>()\n\n// This works - Layer<42, never, never> extends Layer<number, never, never>\nconst validLayer = satisfiesNumber(FortyTwoLayer)\n\n// This would cause a TypeScript compilation error:\n// const invalidLayer = satisfiesNumber(StringLayer)\n//                                     ^^^^^^^^^^^\n// Type 'number' is not assignable to type 'string'";
const moduleRecord = LayerModule as Record<string, unknown>;

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
