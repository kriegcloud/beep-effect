/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: encodeText
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.438Z
 *
 * Overview:
 * Encodes a stream of strings into UTF-8 `Uint8Array` chunks.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 * 
 * const stream = Stream.make("Hello", " ", "World")
 * const program = Effect.gen(function*() {
 *   const encoded = Stream.encodeText(stream)
 *   const chunks = yield* Stream.runCollect(encoded)
 *   const bytes = chunks.map((chunk) => [...chunk])
 *   yield* Console.log(bytes)
 * })
 * 
 * Effect.runPromise(program)
 * // [[72, 101, 108, 108, 111], [32], [87, 111, 114, 108, 100]]
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
const exportName = "encodeText";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Encodes a stream of strings into UTF-8 `Uint8Array` chunks.";
const sourceExample = "import { Console, Effect, Stream } from \"effect\"\n\nconst stream = Stream.make(\"Hello\", \" \", \"World\")\nconst program = Effect.gen(function*() {\n  const encoded = Stream.encodeText(stream)\n  const chunks = yield* Stream.runCollect(encoded)\n  const bytes = chunks.map((chunk) => [...chunk])\n  yield* Console.log(bytes)\n})\n\nEffect.runPromise(program)\n// [[72, 101, 108, 108, 111], [32], [87, 111, 114, 108, 100]]";
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
