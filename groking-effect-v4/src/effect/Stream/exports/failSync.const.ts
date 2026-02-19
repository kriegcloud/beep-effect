/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: failSync
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.438Z
 *
 * Overview:
 * Terminates with the specified lazily evaluated error.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * const stream = Stream.failSync(() => "Uh oh!")
 *
 * const program = Effect.gen(function*() {
 *   const exit = yield* Stream.runCollect(stream).pipe(Effect.exit)
 *   yield* Console.log(exit)
 * })
 *
 * Effect.runPromise(program)
 * // Output:
 * // { _id: 'Exit', _tag: 'Failure', cause: { _id: 'Cause', _tag: 'Fail', failure: 'Uh oh!' } }
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
import * as StreamModule from "effect/Stream";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "failSync";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Terminates with the specified lazily evaluated error.";
const sourceExample =
  "import { Console, Effect, Stream } from \"effect\"\n\nconst stream = Stream.failSync(() => \"Uh oh!\")\n\nconst program = Effect.gen(function*() {\n  const exit = yield* Stream.runCollect(stream).pipe(Effect.exit)\n  yield* Console.log(exit)\n})\n\nEffect.runPromise(program)\n// Output:\n// { _id: 'Exit', _tag: 'Failure', cause: { _id: 'Cause', _tag: 'Fail', failure: 'Uh oh!' } }";
const moduleRecord = StreamModule as Record<string, unknown>;

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
