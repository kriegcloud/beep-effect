/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: toPullScoped
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.642Z
 *
 * Overview:
 * Converts a channel to a Pull within an existing scope.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data, Effect, Scope } from "effect"
 *
 * class ScopedPullError extends Data.TaggedError("ScopedPullError")<{
 *   readonly reason: string
 * }> {}
 *
 * // Create a channel
 * const numbersChannel = Channel.fromIterable([1, 2, 3])
 *
 * // Convert to Pull with explicit scope
 * const scopedPullEffect = Effect.gen(function*() {
 *   const scope = yield* Scope.make()
 *   const pull = yield* Channel.toPullScoped(numbersChannel, scope)
 *   return pull
 * })
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
const exportName = "toPullScoped";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Converts a channel to a Pull within an existing scope.";
const sourceExample =
  'import { Channel, Data, Effect, Scope } from "effect"\n\nclass ScopedPullError extends Data.TaggedError("ScopedPullError")<{\n  readonly reason: string\n}> {}\n\n// Create a channel\nconst numbersChannel = Channel.fromIterable([1, 2, 3])\n\n// Convert to Pull with explicit scope\nconst scopedPullEffect = Effect.gen(function*() {\n  const scope = yield* Scope.make()\n  const pull = yield* Channel.toPullScoped(numbersChannel, scope)\n  return pull\n})';
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
