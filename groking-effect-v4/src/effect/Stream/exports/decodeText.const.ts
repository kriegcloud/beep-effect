/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: decodeText
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.449Z
 *
 * Overview:
 * Decodes Uint8Array chunks into strings using TextDecoder with an optional encoding.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * const encoder = new TextEncoder()
 * const stream = Stream.make(
 *   encoder.encode("Hello"),
 *   encoder.encode(" World")
 * )
 *
 * const program = Effect.gen(function*() {
 *   const decoded = yield* stream.pipe(
 *     Stream.decodeText,
 *     Stream.runCollect
 *   )
 *   yield* Console.log(decoded)
 * })
 *
 * Effect.runPromise(program)
 * // ["Hello", " World"]
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
import * as StreamModule from "effect/Stream";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "decodeText";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Decodes Uint8Array chunks into strings using TextDecoder with an optional encoding.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nconst encoder = new TextEncoder()\nconst stream = Stream.make(\n  encoder.encode("Hello"),\n  encoder.encode(" World")\n)\n\nconst program = Effect.gen(function*() {\n  const decoded = yield* stream.pipe(\n    Stream.decodeText,\n    Stream.runCollect\n  )\n  yield* Console.log(decoded)\n})\n\nEffect.runPromise(program)\n// ["Hello", " World"]';
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
