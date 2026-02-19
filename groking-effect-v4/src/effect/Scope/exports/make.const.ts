/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Scope
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Scope.ts
 * Generated: 2026-02-19T04:14:20.123Z
 *
 * Overview:
 * Creates a new `Scope` with the specified finalizer strategy.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Exit, Scope } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create a scope with sequential cleanup
 *   const scope = yield* Scope.make("sequential")
 *
 *   // Add finalizers
 *   yield* Scope.addFinalizer(scope, Console.log("Cleanup 1"))
 *   yield* Scope.addFinalizer(scope, Console.log("Cleanup 2"))
 *
 *   // Close the scope (finalizers run in reverse order)
 *   yield* Scope.close(scope, Exit.void)
 *   // Output: "Cleanup 2", then "Cleanup 1"
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
import * as ScopeModule from "effect/Scope";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/Scope";
const sourceSummary = "Creates a new `Scope` with the specified finalizer strategy.";
const sourceExample =
  'import { Console, Effect, Exit, Scope } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create a scope with sequential cleanup\n  const scope = yield* Scope.make("sequential")\n\n  // Add finalizers\n  yield* Scope.addFinalizer(scope, Console.log("Cleanup 1"))\n  yield* Scope.addFinalizer(scope, Console.log("Cleanup 2"))\n\n  // Close the scope (finalizers run in reverse order)\n  yield* Scope.close(scope, Exit.void)\n  // Output: "Cleanup 2", then "Cleanup 1"\n})';
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
