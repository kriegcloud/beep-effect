/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Deferred
 * Export: poll
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Deferred.ts
 * Generated: 2026-02-19T04:50:34.633Z
 *
 * Overview:
 * Returns a `Effect<A, E, R>` from the `Deferred` if this `Deferred` has already been completed, `undefined` otherwise.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   const beforeCompletion = yield* Deferred.poll(deferred)
 *   console.log(beforeCompletion === undefined) // true
 *
 *   yield* Deferred.succeed(deferred, 42)
 *   const afterCompletion = yield* Deferred.poll(deferred)
 *   console.log(afterCompletion !== undefined) // true
 * })
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as DeferredModule from "effect/Deferred";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "poll";
const exportKind = "function";
const moduleImportPath = "effect/Deferred";
const sourceSummary =
  "Returns a `Effect<A, E, R>` from the `Deferred` if this `Deferred` has already been completed, `undefined` otherwise.";
const sourceExample =
  'import { Deferred, Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  const deferred = yield* Deferred.make<number>()\n  const beforeCompletion = yield* Deferred.poll(deferred)\n  console.log(beforeCompletion === undefined) // true\n\n  yield* Deferred.succeed(deferred, 42)\n  const afterCompletion = yield* Deferred.poll(deferred)\n  console.log(afterCompletion !== undefined) // true\n})';
const moduleRecord = DeferredModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleFunctionInvocation = Effect.gen(function* () {
  yield* Console.log("Execute a safe zero-arg invocation probe.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery,
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation,
    },
  ],
});

BunRuntime.runMain(program);
