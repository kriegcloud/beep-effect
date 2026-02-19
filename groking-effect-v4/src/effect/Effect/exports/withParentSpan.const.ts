/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: withParentSpan
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.397Z
 *
 * Overview:
 * Adds the provided span to the current span stack.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const span = yield* Effect.makeSpan("parent-span")
 *   const childTask = Effect.log("Child operation")
 *   yield* Effect.withParentSpan(childTask, span)
 *   return "completed"
 * })
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
const exportName = "withParentSpan";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Adds the provided span to the current span stack.";
const sourceExample =
  'import { Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  const span = yield* Effect.makeSpan("parent-span")\n  const childTask = Effect.log("Child operation")\n  yield* Effect.withParentSpan(childTask, span)\n  return "completed"\n})';
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
