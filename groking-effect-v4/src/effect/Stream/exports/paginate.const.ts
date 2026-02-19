/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: paginate
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.463Z
 *
 * Overview:
 * Like `Stream.unfold`, but allows the emission of values to end one step further than the unfolding of the state. This is useful for embedding paginated APIs, hence the name.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 * import * as Option from "effect/Option"
 *
 * const stream = Stream.paginate(0, (n: number) =>
 *   Effect.succeed(
 *     [
 *       [n],
 *       n < 3 ? Option.some(n + 1) : Option.none<number>()
 *     ] as const
 *   ))
 *
 * Effect.runPromise(Stream.runCollect(stream)).then(console.log)
 * // Output: [ 0, 1, 2, 3 ]
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
const exportName = "paginate";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Like `Stream.unfold`, but allows the emission of values to end one step further than the unfolding of the state. This is useful for embedding paginated APIs, hence the name.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\nimport * as Option from "effect/Option"\n\nconst stream = Stream.paginate(0, (n: number) =>\n  Effect.succeed(\n    [\n      [n],\n      n < 3 ? Option.some(n + 1) : Option.none<number>()\n    ] as const\n  ))\n\nEffect.runPromise(Stream.runCollect(stream)).then(console.log)\n// Output: [ 0, 1, 2, 3 ]';
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
