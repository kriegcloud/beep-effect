/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: map
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:50:34.226Z
 *
 * Overview:
 * Maps the output of this channel using the specified function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class TransformError extends Data.TaggedError("TransformError")<{
 *   readonly reason: string
 * }> {}
 *
 * // Basic mapping of channel values
 * const numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5])
 * const doubledChannel = Channel.map(numbersChannel, (n) => n * 2)
 * // Outputs: 2, 4, 6, 8, 10
 *
 * // Transform string data
 * const wordsChannel = Channel.fromIterable(["hello", "world", "effect"])
 * const upperCaseChannel = Channel.map(wordsChannel, (word) => word.toUpperCase())
 * // Outputs: "HELLO", "WORLD", "EFFECT"
 *
 * // Complex object transformation
 * type User = { id: number; name: string }
 * type UserDisplay = { displayName: string; isActive: boolean }
 *
 * const usersChannel = Channel.fromIterable([
 *   { id: 1, name: "Alice" },
 *   { id: 2, name: "Bob" }
 * ])
 * const displayChannel = Channel.map(usersChannel, (user): UserDisplay => ({
 *   displayName: `User: ${user.name}`,
 *   isActive: true
 * }))
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
const exportName = "map";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Maps the output of this channel using the specified function.";
const sourceExample =
  'import { Channel, Data } from "effect"\n\nclass TransformError extends Data.TaggedError("TransformError")<{\n  readonly reason: string\n}> {}\n\n// Basic mapping of channel values\nconst numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5])\nconst doubledChannel = Channel.map(numbersChannel, (n) => n * 2)\n// Outputs: 2, 4, 6, 8, 10\n\n// Transform string data\nconst wordsChannel = Channel.fromIterable(["hello", "world", "effect"])\nconst upperCaseChannel = Channel.map(wordsChannel, (word) => word.toUpperCase())\n// Outputs: "HELLO", "WORLD", "EFFECT"\n\n// Complex object transformation\ntype User = { id: number; name: string }\ntype UserDisplay = { displayName: string; isActive: boolean }\n\nconst usersChannel = Channel.fromIterable([\n  { id: 1, name: "Alice" },\n  { id: 2, name: "Bob" }\n])\nconst displayChannel = Channel.map(usersChannel, (user): UserDisplay => ({\n  displayName: `User: ${user.name}`,\n  isActive: true\n}))';
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
