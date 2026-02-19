/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: as
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.386Z
 *
 * Overview:
 * Replaces the value inside an effect with a constant value.
 *
 * Source JSDoc Example:
 * ```ts
 * // Title: Replacing a Value
 * import { Effect, pipe } from "effect"
 * 
 * // Replaces the value 5 with the constant "new value"
 * const program = pipe(Effect.succeed(5), Effect.as("new value"))
 * 
 * Effect.runPromise(program).then(console.log)
 * // Output: "new value"
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as EffectModule from "effect/Effect";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "as";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Replaces the value inside an effect with a constant value.";
const sourceExample = "// Title: Replacing a Value\nimport { Effect, pipe } from \"effect\"\n\n// Replaces the value 5 with the constant \"new value\"\nconst program = pipe(Effect.succeed(5), Effect.as(\"new value\"))\n\nEffect.runPromise(program).then(console.log)\n// Output: \"new value\"";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
