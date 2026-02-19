/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Scope
 * Export: Closeable
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Scope.ts
 * Generated: 2026-02-19T04:14:20.123Z
 *
 * Overview:
 * A `Closeable` scope extends the base `Scope` interface with the ability to be closed, executing all registered finalizers.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Exit, Scope } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const scope = yield* Scope.make()
 * 
 *   // Add a finalizer
 *   yield* Scope.addFinalizer(scope, Console.log("Cleanup!"))
 * 
 *   // Scope can be closed
 *   yield* Scope.close(scope, Exit.void)
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ScopeModule from "effect/Scope";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Closeable";
const exportKind = "interface";
const moduleImportPath = "effect/Scope";
const sourceSummary = "A `Closeable` scope extends the base `Scope` interface with the ability to be closed, executing all registered finalizers.";
const sourceExample = "import { Console, Effect, Exit, Scope } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const scope = yield* Scope.make()\n\n  // Add a finalizer\n  yield* Scope.addFinalizer(scope, Console.log(\"Cleanup!\"))\n\n  // Scope can be closed\n  yield* Scope.close(scope, Exit.void)\n})";
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
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
