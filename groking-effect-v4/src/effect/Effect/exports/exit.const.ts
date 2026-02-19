/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: exit
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.908Z
 *
 * Overview:
 * Transforms an effect to encapsulate both failure and success using the `Exit` data type.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const success = Effect.succeed(42)
 * const failure = Effect.fail("Something went wrong")
 *
 * const program1 = Effect.exit(success)
 * const program2 = Effect.exit(failure)
 *
 * Effect.runPromise(program1).then(console.log)
 * // { _id: 'Exit', _tag: 'Success', value: 42 }
 *
 * Effect.runPromise(program2).then(console.log)
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "exit";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Transforms an effect to encapsulate both failure and success using the `Exit` data type.";
const sourceExample =
  "import { Effect } from \"effect\"\n\nconst success = Effect.succeed(42)\nconst failure = Effect.fail(\"Something went wrong\")\n\nconst program1 = Effect.exit(success)\nconst program2 = Effect.exit(failure)\n\nEffect.runPromise(program1).then(console.log)\n// { _id: 'Exit', _tag: 'Success', value: 42 }\n\nEffect.runPromise(program2).then(console.log)\n// { _id: 'Exit', _tag: 'Failure', cause: { _id: 'Cause', _tag: 'Fail', failure: 'Something went wrong' } }";
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
