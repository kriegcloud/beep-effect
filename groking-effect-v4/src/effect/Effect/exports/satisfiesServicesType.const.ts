/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: satisfiesServicesType
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.914Z
 *
 * Overview:
 * Ensures that an effect's requirements type extends a given type `R`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * // Define a constraint that requires a string as the requirements type
 * const satisfiesStringServices = Effect.satisfiesServicesType<string>()
 *
 * // This works - effect requires string
 * const validEffect: Effect.Effect<number, never, "config"> = Effect.succeed(42)
 * const constrainedEffect = satisfiesStringServices(validEffect)
 *
 * // This would cause a TypeScript compilation error if uncommented:
 * // const invalidEffect: Effect.Effect<number, never, number> = Effect.succeed(42)
 * // const constrainedInvalid = satisfiesStringServices(invalidEffect)
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "satisfiesServicesType";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Ensures that an effect's requirements type extends a given type `R`.";
const sourceExample =
  'import { Effect } from "effect"\n\n// Define a constraint that requires a string as the requirements type\nconst satisfiesStringServices = Effect.satisfiesServicesType<string>()\n\n// This works - effect requires string\nconst validEffect: Effect.Effect<number, never, "config"> = Effect.succeed(42)\nconst constrainedEffect = satisfiesStringServices(validEffect)\n\n// This would cause a TypeScript compilation error if uncommented:\n// const invalidEffect: Effect.Effect<number, never, number> = Effect.succeed(42)\n// const constrainedInvalid = satisfiesStringServices(invalidEffect)';
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
