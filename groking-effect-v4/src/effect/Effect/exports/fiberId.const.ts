/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: fiberId
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.388Z
 *
 * Overview:
 * Access the current fiber id executing the effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * 
 * const program = Effect.log("event").pipe(
 *   // Read the current span with the fiber id for tagging.
 *   Effect.andThen(Effect.all([Effect.currentSpan, Effect.fiberId])),
 *   Effect.withSpan("A"),
 *   Effect.map(([span, fiberId]) => ({
 *     spanName: span.name,
 *     fiberId
 *   }))
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
const exportName = "fiberId";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Access the current fiber id executing the effect.";
const sourceExample = "import { Effect } from \"effect\"\n\nconst program = Effect.log(\"event\").pipe(\n  // Read the current span with the fiber id for tagging.\n  Effect.andThen(Effect.all([Effect.currentSpan, Effect.fiberId])),\n  Effect.withSpan(\"A\"),\n  Effect.map(([span, fiberId]) => ({\n    spanName: span.name,\n    fiberId\n  }))\n)";
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
