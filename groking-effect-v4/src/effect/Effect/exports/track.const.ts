/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: track
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.395Z
 *
 * Overview:
 * Updates the `Metric` every time the `Effect` is executed.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Metric } from "effect"
 * 
 * const counter = Metric.counter("effect_executions", {
 *   description: "Counts effect executions"
 * }).pipe(Metric.withConstantInput(1))
 * 
 * const program = Effect.succeed("Hello").pipe(
 *   Effect.track(counter)
 * )
 * 
 * // This will increment the counter by 1 when executed
 * Effect.runPromise(program).then(() =>
 *   Effect.runPromise(Metric.value(counter)).then(console.log)
 *   // Output: { count: 1, incremental: false }
 * )
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
const exportName = "track";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Updates the `Metric` every time the `Effect` is executed.";
const sourceExample = "import { Effect, Metric } from \"effect\"\n\nconst counter = Metric.counter(\"effect_executions\", {\n  description: \"Counts effect executions\"\n}).pipe(Metric.withConstantInput(1))\n\nconst program = Effect.succeed(\"Hello\").pipe(\n  Effect.track(counter)\n)\n\n// This will increment the counter by 1 when executed\nEffect.runPromise(program).then(() =>\n  Effect.runPromise(Metric.value(counter)).then(console.log)\n  // Output: { count: 1, incremental: false }\n)";
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
