/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: catchCauseIf
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.436Z
 *
 * Overview:
 * Recovers from stream failures by filtering the `Cause` and switching to a recovery stream. Non-matching causes are re-emitted as failures.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Console, Effect, Stream } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const failingStream = Stream.fail("NetworkError")
 *   const recovered = Stream.catchCauseIf(
 *     failingStream,
 *     (cause) => Cause.hasFails(cause),
 *     (cause) => Stream.make(`Recovered: ${Cause.squash(cause)}`)
 *   )
 * 
 *   const output = yield* Stream.runCollect(recovered)
 *   yield* Console.log(output)
 * })
 * 
 * Effect.runPromise(program)
 * // Output: [ "Recovered: NetworkError" ]
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
const exportName = "catchCauseIf";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Recovers from stream failures by filtering the `Cause` and switching to a recovery stream. Non-matching causes are re-emitted as failures.";
const sourceExample = "import { Cause, Console, Effect, Stream } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const failingStream = Stream.fail(\"NetworkError\")\n  const recovered = Stream.catchCauseIf(\n    failingStream,\n    (cause) => Cause.hasFails(cause),\n    (cause) => Stream.make(`Recovered: ${Cause.squash(cause)}`)\n  )\n\n  const output = yield* Stream.runCollect(recovered)\n  yield* Console.log(output)\n})\n\nEffect.runPromise(program)\n// Output: [ \"Recovered: NetworkError\" ]";
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
