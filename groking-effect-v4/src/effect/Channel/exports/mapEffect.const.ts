/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: mapEffect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.227Z
 *
 * Overview:
 * Returns a new channel, which sequentially combines this channel, together with the provided factory function, which creates a second channel based on the output values of this channel. The result is a channel that will first perform the functions of this channel, before performing the functions of the created channel (including yielding its terminal value).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data, Effect } from "effect"
 *
 * class NetworkError extends Data.TaggedError("NetworkError")<{
 *   readonly url: string
 * }> {}
 *
 * // Transform values using effectful operations
 * const urlsChannel = Channel.fromIterable([
 *   "/api/users/1",
 *   "/api/users/2",
 *   "/api/users/3"
 * ])
 *
 * const fetchDataChannel = Channel.mapEffect(
 *   urlsChannel,
 *   (url) =>
 *     Effect.tryPromise({
 *       try: () => fetch(url).then((res) => res.json()),
 *       catch: () => new NetworkError({ url })
 *     })
 * )
 *
 * // Concurrent processing with options
 * const numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5])
 * const processedChannel = Channel.mapEffect(
 *   numbersChannel,
 *   (n) =>
 *     Effect.gen(function*() {
 *       yield* Effect.sleep("100 millis") // Simulate async work
 *       return n * n
 *     }),
 *   { concurrency: 3, unordered: true }
 * )
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
import * as ChannelModule from "effect/Channel";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "mapEffect";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary =
  "Returns a new channel, which sequentially combines this channel, together with the provided factory function, which creates a second channel based on the output values of this c...";
const sourceExample =
  'import { Channel, Data, Effect } from "effect"\n\nclass NetworkError extends Data.TaggedError("NetworkError")<{\n  readonly url: string\n}> {}\n\n// Transform values using effectful operations\nconst urlsChannel = Channel.fromIterable([\n  "/api/users/1",\n  "/api/users/2",\n  "/api/users/3"\n])\n\nconst fetchDataChannel = Channel.mapEffect(\n  urlsChannel,\n  (url) =>\n    Effect.tryPromise({\n      try: () => fetch(url).then((res) => res.json()),\n      catch: () => new NetworkError({ url })\n    })\n)\n\n// Concurrent processing with options\nconst numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5])\nconst processedChannel = Channel.mapEffect(\n  numbersChannel,\n  (n) =>\n    Effect.gen(function*() {\n      yield* Effect.sleep("100 millis") // Simulate async work\n      return n * n\n    }),\n  { concurrency: 3, unordered: true }\n)';
const moduleRecord = ChannelModule as Record<string, unknown>;

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
