/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Scope
 * Export: addFinalizerExit
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Scope.ts
 * Generated: 2026-02-19T04:14:20.123Z
 *
 * Overview:
 * Adds a finalizer to a scope that will be executed when the scope is closed. Finalizers are cleanup functions that receive the exit value of the scope.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Exit, Scope } from "effect"
 *
 * const withResource = Effect.gen(function*() {
 *   const scope = yield* Scope.make()
 *
 *   // Add a finalizer for cleanup
 *   yield* Scope.addFinalizerExit(
 *     scope,
 *     (exit) =>
 *       Console.log(
 *         `Cleaning up resource. Exit: ${
 *           Exit.isSuccess(exit) ? "Success" : "Failure"
 *         }`
 *       )
 *   )
 *
 *   // Use the resource
 *   yield* Console.log("Using resource")
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ScopeModule from "effect/Scope";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "addFinalizerExit";
const exportKind = "const";
const moduleImportPath = "effect/Scope";
const sourceSummary =
  "Adds a finalizer to a scope that will be executed when the scope is closed. Finalizers are cleanup functions that receive the exit value of the scope.";
const sourceExample =
  'import { Console, Effect, Exit, Scope } from "effect"\n\nconst withResource = Effect.gen(function*() {\n  const scope = yield* Scope.make()\n\n  // Add a finalizer for cleanup\n  yield* Scope.addFinalizerExit(\n    scope,\n    (exit) =>\n      Console.log(\n        `Cleaning up resource. Exit: ${\n          Exit.isSuccess(exit) ? "Success" : "Failure"\n        }`\n      )\n  )\n\n  // Use the resource\n  yield* Console.log("Using resource")\n\n  // Close the scope\n  yield* Scope.close(scope, Exit.void)\n})';
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
