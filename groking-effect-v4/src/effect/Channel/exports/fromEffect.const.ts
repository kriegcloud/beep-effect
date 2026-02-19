/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: fromEffect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.637Z
 *
 * Overview:
 * Use an effect to write a single value to the channel.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data, Effect } from "effect"
 *
 * class DatabaseError extends Data.TaggedError("DatabaseError")<{
 *   readonly message: string
 * }> {}
 *
 * // Create a channel from a successful effect
 * const successChannel = Channel.fromEffect(
 *   Effect.succeed("Hello from effect!")
 * )
 *
 * // Create a channel from an effect that might fail
 * const fetchUserChannel = Channel.fromEffect(
 *   Effect.tryPromise({
 *     try: () => fetch("/api/user").then((res) => res.json()),
 *     catch: (error) => new DatabaseError({ message: String(error) })
 *   })
 * )
 *
 * // Channel from effect with async computation
 * const asyncChannel = Channel.fromEffect(
 *   Effect.gen(function*() {
 *     yield* Effect.sleep("100 millis")
 *     return "Async result"
 *   })
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ChannelModule from "effect/Channel";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromEffect";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Use an effect to write a single value to the channel.";
const sourceExample =
  'import { Channel, Data, Effect } from "effect"\n\nclass DatabaseError extends Data.TaggedError("DatabaseError")<{\n  readonly message: string\n}> {}\n\n// Create a channel from a successful effect\nconst successChannel = Channel.fromEffect(\n  Effect.succeed("Hello from effect!")\n)\n\n// Create a channel from an effect that might fail\nconst fetchUserChannel = Channel.fromEffect(\n  Effect.tryPromise({\n    try: () => fetch("/api/user").then((res) => res.json()),\n    catch: (error) => new DatabaseError({ message: String(error) })\n  })\n)\n\n// Channel from effect with async computation\nconst asyncChannel = Channel.fromEffect(\n  Effect.gen(function*() {\n    yield* Effect.sleep("100 millis")\n    return "Async result"\n  })\n)';
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
