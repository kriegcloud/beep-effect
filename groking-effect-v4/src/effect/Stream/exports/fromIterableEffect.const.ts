/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: fromIterableEffect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.452Z
 *
 * Overview:
 * Creates a stream from an effect producing an iterable of values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, ServiceMap, Stream } from "effect"
 *
 * class UserRepo extends ServiceMap.Service<UserRepo, {
 *   readonly list: Effect.Effect<ReadonlyArray<string>>
 * }>()("UserRepo") {}
 *
 * const listUsers = Effect.service(UserRepo).pipe(
 *   Effect.andThen((repo) => repo.list)
 * )
 *
 * const stream = Stream.fromIterableEffect(listUsers)
 *
 * const program = Effect.gen(function*() {
 *   const users = yield* stream.pipe(
 *     Stream.provideService(UserRepo, {
 *       list: Effect.succeed(["user1", "user2"])
 *     }),
 *     Stream.runCollect
 *   )
 *   yield* Console.log(users)
 * })
 *
 * Effect.runPromise(program)
 * // Output: [ "user1", "user2" ]
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
const exportName = "fromIterableEffect";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary = "Creates a stream from an effect producing an iterable of values.";
const sourceExample =
  'import { Console, Effect, ServiceMap, Stream } from "effect"\n\nclass UserRepo extends ServiceMap.Service<UserRepo, {\n  readonly list: Effect.Effect<ReadonlyArray<string>>\n}>()("UserRepo") {}\n\nconst listUsers = Effect.service(UserRepo).pipe(\n  Effect.andThen((repo) => repo.list)\n)\n\nconst stream = Stream.fromIterableEffect(listUsers)\n\nconst program = Effect.gen(function*() {\n  const users = yield* stream.pipe(\n    Stream.provideService(UserRepo, {\n      list: Effect.succeed(["user1", "user2"])\n    }),\n    Stream.runCollect\n  )\n  yield* Console.log(users)\n})\n\nEffect.runPromise(program)\n// Output: [ "user1", "user2" ]';
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
