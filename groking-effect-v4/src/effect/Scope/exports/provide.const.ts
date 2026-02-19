/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Scope
 * Export: provide
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Scope.ts
 * Generated: 2026-02-19T04:14:20.123Z
 *
 * Overview:
 * Provides a `Scope` to an `Effect`, removing the `Scope` requirement from its context. This allows you to run effects that require a scope by explicitly providing one.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Scope } from "effect"
 *
 * // An effect that requires a Scope
 * const program = Effect.gen(function*() {
 *   const scope = yield* Scope.Scope
 *   yield* Scope.addFinalizer(scope, Console.log("Cleanup"))
 *   yield* Console.log("Working...")
 * })
 *
 * // Provide a scope to the program
 * const withScope = Effect.gen(function*() {
 *   const scope = yield* Scope.make()
 *   yield* Scope.provide(scope)(program)
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
const exportName = "provide";
const exportKind = "const";
const moduleImportPath = "effect/Scope";
const sourceSummary =
  "Provides a `Scope` to an `Effect`, removing the `Scope` requirement from its context. This allows you to run effects that require a scope by explicitly providing one.";
const sourceExample =
  'import { Console, Effect, Scope } from "effect"\n\n// An effect that requires a Scope\nconst program = Effect.gen(function*() {\n  const scope = yield* Scope.Scope\n  yield* Scope.addFinalizer(scope, Console.log("Cleanup"))\n  yield* Console.log("Working...")\n})\n\n// Provide a scope to the program\nconst withScope = Effect.gen(function*() {\n  const scope = yield* Scope.make()\n  yield* Scope.provide(scope)(program)\n})';
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
