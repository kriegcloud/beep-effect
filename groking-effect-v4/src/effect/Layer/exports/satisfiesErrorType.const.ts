/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Layer
 * Export: satisfiesErrorType
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Layer.ts
 * Generated: 2026-02-19T04:50:37.315Z
 *
 * Overview:
 * Ensures that an layer's error type extends a given type `E`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Layer } from "effect"
 *
 * declare const ErrorLayer: Layer.Layer<never, Error, never>
 * declare const TypeErrorLayer: Layer.Layer<never, TypeError, never>
 * declare const StringLayer: Layer.Layer<never, string, never>
 *
 * // Define a constraint that the error type must be an Error
 * const satisfiesError = Layer.satisfiesErrorType<Error>()
 *
 * // This works - Layer<never, TypeError, never> extends Layer<never, Error, never>
 * const validLayer = satisfiesError(TypeErrorLayer)
 *
 * // This would cause a TypeScript compilation error:
 * // const invalidLayer = satisfiesError(StringLayer)
 * //                                     ^^^^^^^^^^^
 * // Type 'string' is not assignable to type 'Error'
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
const exportName = "satisfiesErrorType";
const exportKind = "const";
const moduleImportPath = "effect/Layer";
const sourceSummary = "Ensures that an layer's error type extends a given type `E`.";
const sourceExample =
  "import { Layer } from \"effect\"\n\ndeclare const ErrorLayer: Layer.Layer<never, Error, never>\ndeclare const TypeErrorLayer: Layer.Layer<never, TypeError, never>\ndeclare const StringLayer: Layer.Layer<never, string, never>\n\n// Define a constraint that the error type must be an Error\nconst satisfiesError = Layer.satisfiesErrorType<Error>()\n\n// This works - Layer<never, TypeError, never> extends Layer<never, Error, never>\nconst validLayer = satisfiesError(TypeErrorLayer)\n\n// This would cause a TypeScript compilation error:\n// const invalidLayer = satisfiesError(StringLayer)\n//                                     ^^^^^^^^^^^\n// Type 'string' is not assignable to type 'Error'";
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
