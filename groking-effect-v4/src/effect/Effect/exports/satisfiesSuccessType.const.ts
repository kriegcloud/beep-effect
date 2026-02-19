/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: satisfiesSuccessType
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.394Z
 *
 * Overview:
 * Ensures that an effect's success type extends a given type `A`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * // Define a constraint that the success type must be a number
 * const satisfiesNumber = Effect.satisfiesSuccessType<number>()
 *
 * // This works - Effect<42, never, never> extends Effect<number, never, never>
 * const validEffect = satisfiesNumber(Effect.succeed(42))
 *
 * // This would cause a TypeScript compilation error:
 * // const invalidEffect = satisfiesNumber(Effect.succeed("string"))
 * //                                      ^^^^^^^^^^^^^^^^^^^^^^
 * // Type 'string' is not assignable to type 'number'
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "satisfiesSuccessType";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Ensures that an effect's success type extends a given type `A`.";
const sourceExample =
  "import { Effect } from \"effect\"\n\n// Define a constraint that the success type must be a number\nconst satisfiesNumber = Effect.satisfiesSuccessType<number>()\n\n// This works - Effect<42, never, never> extends Effect<number, never, never>\nconst validEffect = satisfiesNumber(Effect.succeed(42))\n\n// This would cause a TypeScript compilation error:\n// const invalidEffect = satisfiesNumber(Effect.succeed(\"string\"))\n//                                      ^^^^^^^^^^^^^^^^^^^^^^\n// Type 'string' is not assignable to type 'number'";
const moduleRecord = EffectModule as Record<string, unknown>;

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
