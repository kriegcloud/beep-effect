/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: transformPullBracket
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.445Z
 *
 * Overview:
 * Transforms a stream by effectfully transforming its pull effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Scope, Stream } from "effect"
 * 
 * const stream = Stream.make(1, 2, 3)
 * 
 * const transformed = Stream.transformPullBracket(
 *   stream,
 *   (pull, _scope, forkedScope) =>
 *     Effect.gen(function*() {
 *       yield* Scope.addFinalizer(forkedScope, Console.log("Releasing scope"))
 *       return pull
 *     })
 * )
 * 
 * const program = Effect.gen(function*() {
 *   const values = yield* Stream.runCollect(transformed)
 *   yield* Console.log(values)
 * })
 * 
 * Effect.runPromise(program)
 * // Output: [1, 2, 3]
 * // Releasing scope
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
const exportName = "transformPullBracket";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Transforms a stream by effectfully transforming its pull effect.";
const sourceExample = "import { Console, Effect, Scope, Stream } from \"effect\"\n\nconst stream = Stream.make(1, 2, 3)\n\nconst transformed = Stream.transformPullBracket(\n  stream,\n  (pull, _scope, forkedScope) =>\n    Effect.gen(function*() {\n      yield* Scope.addFinalizer(forkedScope, Console.log(\"Releasing scope\"))\n      return pull\n    })\n)\n\nconst program = Effect.gen(function*() {\n  const values = yield* Stream.runCollect(transformed)\n  yield* Console.log(values)\n})\n\nEffect.runPromise(program)\n// Output: [1, 2, 3]\n// Releasing scope";
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
