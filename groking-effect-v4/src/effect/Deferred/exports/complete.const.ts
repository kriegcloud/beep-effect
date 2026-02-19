/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Deferred
 * Export: complete
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Deferred.ts
 * Generated: 2026-02-19T04:14:11.284Z
 *
 * Overview:
 * Completes the deferred with the result of the specified effect. If the deferred has already been completed, the method will produce false.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   const completed = yield* Deferred.complete(deferred, Effect.succeed(42))
 *   console.log(completed) // true
 *
 *   const value = yield* Deferred.await(deferred)
 *   console.log(value) // 42
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
import * as DeferredModule from "effect/Deferred";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "complete";
const exportKind = "const";
const moduleImportPath = "effect/Deferred";
const sourceSummary =
  "Completes the deferred with the result of the specified effect. If the deferred has already been completed, the method will produce false.";
const sourceExample =
  'import { Deferred, Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  const deferred = yield* Deferred.make<number>()\n  const completed = yield* Deferred.complete(deferred, Effect.succeed(42))\n  console.log(completed) // true\n\n  const value = yield* Deferred.await(deferred)\n  console.log(value) // 42\n})';
const moduleRecord = DeferredModule as Record<string, unknown>;

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
