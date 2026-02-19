/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: zip
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.918Z
 *
 * Overview:
 * Combines two effects into a single effect, producing a tuple with the results of both effects.
 *
 * Source JSDoc Example:
 * ```ts
 * // Title: Combining Two Effects Sequentially
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
 * // Combine the two effects together
 * //
 * //      ┌─── Effect<[number, string], never, never>
 * //      ▼
 * const program = Effect.zip(task1, task2)
 *
 * Effect.runPromise(program).then(console.log)
 * // Output:
 * // timestamp=... level=INFO fiber=#0 message="task1 done"
 * // timestamp=... level=INFO fiber=#0 message="task2 done"
 * // [ 1, 'hello' ]
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
const exportName = "zip";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Combines two effects into a single effect, producing a tuple with the results of both effects.";
const sourceExample =
  '// Title: Combining Two Effects Sequentially\nimport { Effect } from "effect"\n\nconst task1 = Effect.succeed(1).pipe(\n  Effect.delay("200 millis"),\n  Effect.tap(Effect.log("task1 done"))\n)\nconst task2 = Effect.succeed("hello").pipe(\n  Effect.delay("100 millis"),\n  Effect.tap(Effect.log("task2 done"))\n)\n\n// Combine the two effects together\n//\n//      ┌─── Effect<[number, string], never, never>\n//      ▼\nconst program = Effect.zip(task1, task2)\n\nEffect.runPromise(program).then(console.log)\n// Output:\n// timestamp=... level=INFO fiber=#0 message="task1 done"\n// timestamp=... level=INFO fiber=#0 message="task2 done"\n// [ 1, \'hello\' ]';
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
