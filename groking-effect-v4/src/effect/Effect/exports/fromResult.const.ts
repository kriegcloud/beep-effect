/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: fromResult
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.389Z
 *
 * Overview:
 * Converts a `Result` to an `Effect`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Result } from "effect"
 *
 * const success = Result.succeed(42)
 * const failure = Result.fail("Something went wrong")
 *
 * const effect1 = Effect.fromResult(success)
 * const effect2 = Effect.fromResult(failure)
 *
 * Effect.runPromise(effect1).then(console.log) // 42
 * Effect.runPromiseExit(effect2).then(console.log)
 * // { _id: 'Exit', _tag: 'Failure', cause: { _id: 'Cause', _tag: 'Fail', failure: 'Something went wrong' } }
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
const exportName = "fromResult";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Converts a `Result` to an `Effect`.";
const sourceExample =
  "import { Effect, Result } from \"effect\"\n\nconst success = Result.succeed(42)\nconst failure = Result.fail(\"Something went wrong\")\n\nconst effect1 = Effect.fromResult(success)\nconst effect2 = Effect.fromResult(failure)\n\nEffect.runPromise(effect1).then(console.log) // 42\nEffect.runPromiseExit(effect2).then(console.log)\n// { _id: 'Exit', _tag: 'Failure', cause: { _id: 'Cause', _tag: 'Fail', failure: 'Something went wrong' } }";
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
