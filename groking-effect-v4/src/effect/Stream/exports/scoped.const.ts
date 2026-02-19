/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: scoped
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.443Z
 *
 * Overview:
 * Runs a stream that requires `Scope` in a managed scope, ensuring its finalizers are run when the stream completes.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * const stream = Stream.scoped(
 *   Stream.fromEffect(
 *     Effect.acquireRelease(
 *       Console.log("acquire").pipe(Effect.as("resource")),
 *       () => Console.log("release")
 *     )
 *   )
 * )
 *
 * Effect.runPromise(Stream.runCollect(stream)).then(console.log)
 * // acquire
 * // release
 * // [ "resource" ]
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
const exportName = "scoped";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Runs a stream that requires `Scope` in a managed scope, ensuring its finalizers are run when the stream completes.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nconst stream = Stream.scoped(\n  Stream.fromEffect(\n    Effect.acquireRelease(\n      Console.log("acquire").pipe(Effect.as("resource")),\n      () => Console.log("release")\n    )\n  )\n)\n\nEffect.runPromise(Stream.runCollect(stream)).then(console.log)\n// acquire\n// release\n// [ "resource" ]';
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
