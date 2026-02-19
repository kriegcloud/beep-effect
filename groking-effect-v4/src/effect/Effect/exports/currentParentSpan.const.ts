/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: currentParentSpan
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.387Z
 *
 * Overview:
 * Returns the current parent span from the context.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const childOperation = Effect.gen(function*() {
 *   const parentSpan = yield* Effect.currentParentSpan
 *   yield* Effect.log(`Parent span: ${parentSpan}`)
 *   return "child completed"
 * })
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.withSpan(childOperation, "child-span")
 *   return "parent completed"
 * })
 *
 * const traced = Effect.withSpan(program, "parent-span")
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
const exportName = "currentParentSpan";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Returns the current parent span from the context.";
const sourceExample =
  'import { Effect } from "effect"\n\nconst childOperation = Effect.gen(function*() {\n  const parentSpan = yield* Effect.currentParentSpan\n  yield* Effect.log(`Parent span: ${parentSpan}`)\n  return "child completed"\n})\n\nconst program = Effect.gen(function*() {\n  yield* Effect.withSpan(childOperation, "child-span")\n  return "parent completed"\n})\n\nconst traced = Effect.withSpan(program, "parent-span")';
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
