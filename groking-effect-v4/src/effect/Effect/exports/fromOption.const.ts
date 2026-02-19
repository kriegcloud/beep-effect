/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: fromOption
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.389Z
 *
 * Overview:
 * Converts an `Option` to an `Effect`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Option } from "effect"
 *
 * const some = Option.some(42)
 * const none = Option.none()
 *
 * const effect1 = Effect.fromOption(some)
 * const effect2 = Effect.fromOption(none)
 *
 * Effect.runPromise(effect1).then(console.log) // 42
 * Effect.runPromiseExit(effect2).then(console.log)
 * // { _id: 'Exit', _tag: 'Failure', cause: { _id: 'Cause', _tag: 'Fail', failure: { _id: 'NoSuchElementError' } } }
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
const exportName = "fromOption";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Converts an `Option` to an `Effect`.";
const sourceExample =
  "import { Effect, Option } from \"effect\"\n\nconst some = Option.some(42)\nconst none = Option.none()\n\nconst effect1 = Effect.fromOption(some)\nconst effect2 = Effect.fromOption(none)\n\nEffect.runPromise(effect1).then(console.log) // 42\nEffect.runPromiseExit(effect2).then(console.log)\n// { _id: 'Exit', _tag: 'Failure', cause: { _id: 'Cause', _tag: 'Fail', failure: { _id: 'NoSuchElementError' } } }";
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
