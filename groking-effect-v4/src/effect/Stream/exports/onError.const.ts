/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: onError
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.441Z
 *
 * Overview:
 * Runs the provided effect when the stream fails, passing the failure cause.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Console, Effect, Stream } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const stream = Stream.make(1, 2, 3).pipe(
 *     Stream.concat(Stream.fail("boom")),
 *     Stream.onError((cause) => Console.log(`Stream failed: ${Cause.squash(cause)}`))
 *   )
 * 
 *   yield* Stream.runCollect(stream)
 * })
 * 
 * Effect.runPromiseExit(program)
 * // Output:
 * // Stream failed: boom
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as StreamModule from "effect/Stream";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "onError";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Runs the provided effect when the stream fails, passing the failure cause.";
const sourceExample = "import { Cause, Console, Effect, Stream } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const stream = Stream.make(1, 2, 3).pipe(\n    Stream.concat(Stream.fail(\"boom\")),\n    Stream.onError((cause) => Console.log(`Stream failed: ${Cause.squash(cause)}`))\n  )\n\n  yield* Stream.runCollect(stream)\n})\n\nEffect.runPromiseExit(program)\n// Output:\n// Stream failed: boom";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
