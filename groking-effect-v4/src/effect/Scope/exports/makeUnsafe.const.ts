/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Scope
 * Export: makeUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Scope.ts
 * Generated: 2026-02-19T04:50:40.703Z
 *
 * Overview:
 * Creates a new `Scope` synchronously without wrapping it in an `Effect`. This is useful when you need a scope immediately but should be used with caution as it doesn't provide the same safety guarantees as the `Effect`-wrapped version.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Exit, Scope } from "effect"
 *
 * // Create a scope immediately
 * const scope = Scope.makeUnsafe("sequential")
 *
 * // Use it in an Effect program
 * const program = Effect.gen(function*() {
 *   yield* Scope.addFinalizer(scope, Console.log("Cleanup"))
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
const exportName = "makeUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Scope";
const sourceSummary =
  "Creates a new `Scope` synchronously without wrapping it in an `Effect`. This is useful when you need a scope immediately but should be used with caution as it doesn't provide th...";
const sourceExample =
  'import { Console, Effect, Exit, Scope } from "effect"\n\n// Create a scope immediately\nconst scope = Scope.makeUnsafe("sequential")\n\n// Use it in an Effect program\nconst program = Effect.gen(function*() {\n  yield* Scope.addFinalizer(scope, Console.log("Cleanup"))\n  yield* Scope.close(scope, Exit.void)\n})';
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
