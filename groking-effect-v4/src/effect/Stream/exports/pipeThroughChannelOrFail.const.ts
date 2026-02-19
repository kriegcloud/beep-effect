/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: pipeThroughChannelOrFail
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.442Z
 *
 * Overview:
 * Pipes values through the provided channel while preserving this stream's failures alongside any channel failures.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Channel } from "effect"
 * import { Console, Effect, Stream } from "effect"
 *
 * declare const transformChannel: Channel.Channel<
 *   readonly [string, ...Array<string>],
 *   "ChannelError",
 *   unknown,
 *   readonly [number, ...Array<number>],
 *   "StreamError",
 *   unknown,
 *   never
 * >
 *
 * Effect.runPromise(Effect.gen(function*() {
 *   const result = yield* Stream.make(1, 2, 3).pipe(
 *     Stream.pipeThroughChannelOrFail(transformChannel),
 *     Stream.runCollect
 *   )
 *
 *   yield* Console.log(result)
 * }))
 * // Output:
 * // ["1", "2", "3"]
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
const exportName = "pipeThroughChannelOrFail";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Pipes values through the provided channel while preserving this stream's failures alongside any channel failures.";
const sourceExample =
  'import type { Channel } from "effect"\nimport { Console, Effect, Stream } from "effect"\n\ndeclare const transformChannel: Channel.Channel<\n  readonly [string, ...Array<string>],\n  "ChannelError",\n  unknown,\n  readonly [number, ...Array<number>],\n  "StreamError",\n  unknown,\n  never\n>\n\nEffect.runPromise(Effect.gen(function*() {\n  const result = yield* Stream.make(1, 2, 3).pipe(\n    Stream.pipeThroughChannelOrFail(transformChannel),\n    Stream.runCollect\n  )\n\n  yield* Console.log(result)\n}))\n// Output:\n// ["1", "2", "3"]';
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
