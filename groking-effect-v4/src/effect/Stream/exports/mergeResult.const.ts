/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: mergeResult
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.441Z
 *
 * Overview:
 * Merges this stream and the specified stream together, tagging values from the left stream as `Result.succeed` and values from the right stream as `Result.fail`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Result, Stream } from "effect"
 * 
 * const left = Stream.fromEffect(Effect.succeed("left"))
 * const right = Stream.fromEffect(Effect.delay(Effect.succeed("right"), "10 millis"))
 * 
 * const merged = left.pipe(
 *   Stream.mergeResult(right),
 *   Stream.map(
 *     Result.match({
 *       onFailure: (value) => `right:${value}`,
 *       onSuccess: (value) => `left:${value}`
 *     })
 *   )
 * )
 * 
 * const program = Effect.gen(function*() {
 *   const result = yield* Stream.runCollect(merged)
 *   yield* Console.log(result)
 * })
 * 
 * Effect.runPromise(program)
 * // Output: [ "left:left", "right:right" ]
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
const exportName = "mergeResult";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Merges this stream and the specified stream together, tagging values from the left stream as `Result.succeed` and values from the right stream as `Result.fail`.";
const sourceExample = "import { Console, Effect, Result, Stream } from \"effect\"\n\nconst left = Stream.fromEffect(Effect.succeed(\"left\"))\nconst right = Stream.fromEffect(Effect.delay(Effect.succeed(\"right\"), \"10 millis\"))\n\nconst merged = left.pipe(\n  Stream.mergeResult(right),\n  Stream.map(\n    Result.match({\n      onFailure: (value) => `right:${value}`,\n      onSuccess: (value) => `left:${value}`\n    })\n  )\n)\n\nconst program = Effect.gen(function*() {\n  const result = yield* Stream.runCollect(merged)\n  yield* Console.log(result)\n})\n\nEffect.runPromise(program)\n// Output: [ \"left:left\", \"right:right\" ]";
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
