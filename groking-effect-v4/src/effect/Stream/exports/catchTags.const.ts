/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: catchTags
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:14:21.437Z
 *
 * Overview:
 * Switches to a recovery stream based on matching `_tag` handlers.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 *
 * class NotFound {
 *   readonly _tag = "NotFound"
 *   constructor(readonly resource: string) {}
 * }
 *
 * class Unauthorized {
 *   readonly _tag = "Unauthorized"
 *   constructor(readonly user: string) {}
 * }
 *
 * const stream = Stream.fail(new NotFound("profile"))
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* stream.pipe(
 *     Stream.catchTags({
 *       NotFound: () => Stream.succeed("fallback"),
 *       Unauthorized: () => Stream.succeed("login")
 *     }),
 *     Stream.runCollect
 *   )
 *   yield* Console.log(result)
 * })
 *
 * // Output: [ "fallback" ]
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
const exportName = "catchTags";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Switches to a recovery stream based on matching `_tag` handlers.";
const sourceExample =
  'import { Console, Effect, Stream } from "effect"\n\nclass NotFound {\n  readonly _tag = "NotFound"\n  constructor(readonly resource: string) {}\n}\n\nclass Unauthorized {\n  readonly _tag = "Unauthorized"\n  constructor(readonly user: string) {}\n}\n\nconst stream = Stream.fail(new NotFound("profile"))\n\nconst program = Effect.gen(function* () {\n  const result = yield* stream.pipe(\n    Stream.catchTags({\n      NotFound: () => Stream.succeed("fallback"),\n      Unauthorized: () => Stream.succeed("login")\n    }),\n    Stream.runCollect\n  )\n  yield* Console.log(result)\n})\n\n// Output: [ "fallback" ]';
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
