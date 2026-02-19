/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Scope
 * Export: addFinalizer
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Scope.ts
 * Generated: 2026-02-19T04:50:40.702Z
 *
 * Overview:
 * Adds a finalizer to a scope. The finalizer is a simple `Effect` that will be executed when the scope is closed, regardless of whether the scope closes successfully or with an error.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Exit, Scope } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const scope = yield* Scope.make()
 *
 *   // Add simple finalizers
 *   yield* Scope.addFinalizer(scope, Console.log("Cleanup task 1"))
 *   yield* Scope.addFinalizer(scope, Console.log("Cleanup task 2"))
 *   yield* Scope.addFinalizer(scope, Effect.log("Cleanup task 3"))
 *
 *   // Do some work
 *   yield* Console.log("Doing work...")
 *
 *   // Close the scope
 *   yield* Scope.close(scope, Exit.void)
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ScopeModule from "effect/Scope";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "addFinalizer";
const exportKind = "const";
const moduleImportPath = "effect/Scope";
const sourceSummary =
  "Adds a finalizer to a scope. The finalizer is a simple `Effect` that will be executed when the scope is closed, regardless of whether the scope closes successfully or with an er...";
const sourceExample =
  'import { Console, Effect, Exit, Scope } from "effect"\n\nconst program = Effect.gen(function*() {\n  const scope = yield* Scope.make()\n\n  // Add simple finalizers\n  yield* Scope.addFinalizer(scope, Console.log("Cleanup task 1"))\n  yield* Scope.addFinalizer(scope, Console.log("Cleanup task 2"))\n  yield* Scope.addFinalizer(scope, Effect.log("Cleanup task 3"))\n\n  // Do some work\n  yield* Console.log("Doing work...")\n\n  // Close the scope\n  yield* Scope.close(scope, Exit.void)\n})';
const moduleRecord = ScopeModule as Record<string, unknown>;

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
