/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: log
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.910Z
 *
 * Overview:
 * Logs one or more messages using the default log level.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.log("Starting computation")
 *   const result = 2 + 2
 *   yield* Effect.log("Result:", result)
 *   yield* Effect.log("Multiple", "values", "can", "be", "logged")
 *   return result
 * })
 *
 * Effect.runPromise(program).then(console.log)
 * // Output:
 * // timestamp=2023-... level=INFO message="Starting computation"
 * // timestamp=2023-... level=INFO message="Result: 4"
 * // timestamp=2023-... level=INFO message="Multiple values can be logged"
 * // 4
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
const exportName = "log";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Logs one or more messages using the default log level.";
const sourceExample =
  'import { Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  yield* Effect.log("Starting computation")\n  const result = 2 + 2\n  yield* Effect.log("Result:", result)\n  yield* Effect.log("Multiple", "values", "can", "be", "logged")\n  return result\n})\n\nEffect.runPromise(program).then(console.log)\n// Output:\n// timestamp=2023-... level=INFO message="Starting computation"\n// timestamp=2023-... level=INFO message="Result: 4"\n// timestamp=2023-... level=INFO message="Multiple values can be logged"\n// 4';
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
