/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: linkSpans
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.910Z
 *
 * Overview:
 * For all spans in this effect, add a link with the provided span.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const parentEffect = Effect.withSpan("parent-operation")(
 *   Effect.succeed("parent result")
 * )
 *
 * const childEffect = Effect.withSpan("child-operation")(
 *   Effect.succeed("child result")
 * )
 *
 * // Link the child span to the parent span
 * const program = Effect.gen(function*() {
 *   const parentSpan = yield* Effect.currentSpan
 *   const result = yield* childEffect.pipe(
 *     Effect.linkSpans(parentSpan, { relationship: "follows" })
 *   )
 *   return result
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "linkSpans";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "For all spans in this effect, add a link with the provided span.";
const sourceExample =
  'import { Effect } from "effect"\n\nconst parentEffect = Effect.withSpan("parent-operation")(\n  Effect.succeed("parent result")\n)\n\nconst childEffect = Effect.withSpan("child-operation")(\n  Effect.succeed("child result")\n)\n\n// Link the child span to the parent span\nconst program = Effect.gen(function*() {\n  const parentSpan = yield* Effect.currentSpan\n  const result = yield* childEffect.pipe(\n    Effect.linkSpans(parentSpan, { relationship: "follows" })\n  )\n  return result\n})';
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
