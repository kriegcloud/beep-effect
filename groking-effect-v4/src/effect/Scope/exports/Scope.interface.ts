/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Scope
 * Export: Scope
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Scope.ts
 * Generated: 2026-02-19T04:14:20.124Z
 *
 * Overview:
 * A `Scope` represents a context where resources can be acquired and automatically cleaned up when the scope is closed. Scopes can use either sequential or parallel finalization strategies.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Exit, Scope } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const scope = yield* Scope.make("sequential")
 *
 *   // Scope has a strategy and state
 *   console.log(scope.strategy) // "sequential"
 *   console.log(scope.state._tag) // "Open"
 *
 *   // Close the scope
 *   yield* Scope.close(scope, Exit.void)
 *   console.log(scope.state._tag) // "Closed"
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ScopeModule from "effect/Scope";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Scope";
const exportKind = "interface";
const moduleImportPath = "effect/Scope";
const sourceSummary =
  "A `Scope` represents a context where resources can be acquired and automatically cleaned up when the scope is closed. Scopes can use either sequential or parallel finalization s...";
const sourceExample =
  'import { Effect, Exit, Scope } from "effect"\n\nconst program = Effect.gen(function*() {\n  const scope = yield* Scope.make("sequential")\n\n  // Scope has a strategy and state\n  console.log(scope.strategy) // "sequential"\n  console.log(scope.state._tag) // "Open"\n\n  // Close the scope\n  yield* Scope.close(scope, Exit.void)\n  console.log(scope.state._tag) // "Closed"\n})';
const moduleRecord = ScopeModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
