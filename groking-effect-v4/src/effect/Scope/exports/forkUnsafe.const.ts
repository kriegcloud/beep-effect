/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Scope
 * Export: forkUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Scope.ts
 * Generated: 2026-02-19T04:14:20.123Z
 *
 * Overview:
 * Creates a child scope from a parent scope synchronously without wrapping it in an `Effect`. The child scope inherits the parent's finalization strategy unless overridden.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Exit, Scope } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const parentScope = Scope.makeUnsafe("sequential")
 *   const childScope = Scope.forkUnsafe(parentScope, "parallel")
 *
 *   // Add finalizers to both scopes
 *   yield* Scope.addFinalizer(parentScope, Console.log("Parent cleanup"))
 *   yield* Scope.addFinalizer(childScope, Console.log("Child cleanup"))
 *
 *   // Close child first, then parent
 *   yield* Scope.close(childScope, Exit.void)
 *   yield* Scope.close(parentScope, Exit.void)
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
const exportName = "forkUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Scope";
const sourceSummary =
  "Creates a child scope from a parent scope synchronously without wrapping it in an `Effect`. The child scope inherits the parent's finalization strategy unless overridden.";
const sourceExample =
  'import { Console, Effect, Exit, Scope } from "effect"\n\nconst program = Effect.gen(function*() {\n  const parentScope = Scope.makeUnsafe("sequential")\n  const childScope = Scope.forkUnsafe(parentScope, "parallel")\n\n  // Add finalizers to both scopes\n  yield* Scope.addFinalizer(parentScope, Console.log("Parent cleanup"))\n  yield* Scope.addFinalizer(childScope, Console.log("Child cleanup"))\n\n  // Close child first, then parent\n  yield* Scope.close(childScope, Exit.void)\n  yield* Scope.close(parentScope, Exit.void)\n})';
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
