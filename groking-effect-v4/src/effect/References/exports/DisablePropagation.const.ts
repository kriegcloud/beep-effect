/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/References
 * Export: DisablePropagation
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Tracer.ts
 * Generated: 2026-02-19T04:14:16.489Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Tracer } from "effect"
 *
 * // Disable span propagation for a specific effect
 * const program = Effect.gen(function*() {
 *   yield* Effect.log("This will not propagate parent span")
 * }).pipe(
 *   Effect.provideService(Tracer.DisablePropagation, true)
 * )
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
import * as ReferencesModule from "effect/References";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "DisablePropagation";
const exportKind = "const";
const moduleImportPath = "effect/References";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample =
  'import { Effect, Tracer } from "effect"\n\n// Disable span propagation for a specific effect\nconst program = Effect.gen(function*() {\n  yield* Effect.log("This will not propagate parent span")\n}).pipe(\n  Effect.provideService(Tracer.DisablePropagation, true)\n)';
const moduleRecord = ReferencesModule as Record<string, unknown>;

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
