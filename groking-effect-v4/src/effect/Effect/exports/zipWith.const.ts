/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: zipWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.918Z
 *
 * Overview:
 * Combines two effects sequentially and applies a function to their results to produce a single value.
 *
 * Source JSDoc Example:
 * ```ts
 * // Title: Combining Effects with a Custom Function
 * import { Effect } from "effect"
 *
 * const task1 = Effect.succeed(1).pipe(
 *   Effect.delay("200 millis"),
 *   Effect.tap(Effect.log("task1 done"))
 * )
 * const task2 = Effect.succeed("hello").pipe(
 *   Effect.delay("100 millis"),
 *   Effect.tap(Effect.log("task2 done"))
 * )
 *
 * const task3 = Effect.zipWith(
 *   task1,
 *   task2,
 *   // Combines results into a single value
 *   (number, string) => number + string.length
 * )
 *
 * Effect.runPromise(task3).then(console.log)
 * // Output:
 * // timestamp=... level=INFO fiber=#3 message="task1 done"
 * // timestamp=... level=INFO fiber=#2 message="task2 done"
 * // 6
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
const exportName = "zipWith";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Combines two effects sequentially and applies a function to their results to produce a single value.";
const sourceExample =
  '// Title: Combining Effects with a Custom Function\nimport { Effect } from "effect"\n\nconst task1 = Effect.succeed(1).pipe(\n  Effect.delay("200 millis"),\n  Effect.tap(Effect.log("task1 done"))\n)\nconst task2 = Effect.succeed("hello").pipe(\n  Effect.delay("100 millis"),\n  Effect.tap(Effect.log("task2 done"))\n)\n\nconst task3 = Effect.zipWith(\n  task1,\n  task2,\n  // Combines results into a single value\n  (number, string) => number + string.length\n)\n\nEffect.runPromise(task3).then(console.log)\n// Output:\n// timestamp=... level=INFO fiber=#3 message="task1 done"\n// timestamp=... level=INFO fiber=#2 message="task2 done"\n// 6';
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
