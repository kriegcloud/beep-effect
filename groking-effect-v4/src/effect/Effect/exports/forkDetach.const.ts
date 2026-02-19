/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: forkDetach
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.389Z
 *
 * Overview:
 * Forks the effect into a new fiber attached to the global scope. Because the new fiber is attached to the global scope, when the fiber executing the returned effect terminates, the forked fiber will continue running.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const daemonTask = Effect.gen(function*() {
 *   while (true) {
 *     yield* Effect.sleep("1 second")
 *     yield* Effect.log("Daemon running...")
 *   }
 * })
 *
 * const program = Effect.gen(function*() {
 *   const fiber = yield* daemonTask.pipe(Effect.forkDetach)
 *
 *   // or fork a fiber that starts immediately:
 *   yield* daemonTask.pipe(Effect.forkDetach({ startImmediately: true }))
 *
 *   yield* Effect.log("Daemon started")
 *   yield* Effect.sleep("3 seconds")
 *   // Daemon continues running after this effect completes
 *   return "main completed"
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
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "forkDetach";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Forks the effect into a new fiber attached to the global scope. Because the new fiber is attached to the global scope, when the fiber executing the returned effect terminates, t...";
const sourceExample =
  'import { Effect } from "effect"\n\nconst daemonTask = Effect.gen(function*() {\n  while (true) {\n    yield* Effect.sleep("1 second")\n    yield* Effect.log("Daemon running...")\n  }\n})\n\nconst program = Effect.gen(function*() {\n  const fiber = yield* daemonTask.pipe(Effect.forkDetach)\n\n  // or fork a fiber that starts immediately:\n  yield* daemonTask.pipe(Effect.forkDetach({ startImmediately: true }))\n\n  yield* Effect.log("Daemon started")\n  yield* Effect.sleep("3 seconds")\n  // Daemon continues running after this effect completes\n  return "main completed"\n})';
const moduleRecord = EffectModule as Record<string, unknown>;

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
