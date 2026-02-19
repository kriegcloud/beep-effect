/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: runSyncExit
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.393Z
 *
 * Overview:
 * Runs an effect synchronously and returns the result as an `Exit` type, which represents the outcome (success or failure) of the effect.
 *
 * Source JSDoc Example:
 * ```ts
 * // Title: Handling Results as Exit
 * import { Effect } from "effect"
 *
 * console.log(Effect.runSyncExit(Effect.succeed(1)))
 * // Output:
 * // {
 * //   _id: "Exit",
 * //   _tag: "Success",
 * //   value: 1
 * // }
 *
 * console.log(Effect.runSyncExit(Effect.fail("my error")))
 * // Output:
 * // {
 * //   _id: "Exit",
 * //   _tag: "Failure",
 * //   cause: {
 * //     _id: "Cause",
 * //     _tag: "Fail",
 * //     failure: "my error"
 * //   }
 * // }
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
const exportName = "runSyncExit";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Runs an effect synchronously and returns the result as an `Exit` type, which represents the outcome (success or failure) of the effect.";
const sourceExample =
  '// Title: Handling Results as Exit\nimport { Effect } from "effect"\n\nconsole.log(Effect.runSyncExit(Effect.succeed(1)))\n// Output:\n// {\n//   _id: "Exit",\n//   _tag: "Success",\n//   value: 1\n// }\n\nconsole.log(Effect.runSyncExit(Effect.fail("my error")))\n// Output:\n// {\n//   _id: "Exit",\n//   _tag: "Failure",\n//   cause: {\n//     _id: "Cause",\n//     _tag: "Fail",\n//     failure: "my error"\n//   }\n// }';
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
