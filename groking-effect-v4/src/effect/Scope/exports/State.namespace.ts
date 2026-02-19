/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Scope
 * Export: State
 * Kind: namespace
 * Source: .repos/effect-smol/packages/effect/src/Scope.ts
 * Generated: 2026-02-19T04:14:20.125Z
 *
 * Overview:
 * The `State` namespace contains types representing the different states a scope can be in: Open (accepting new finalizers) or Closed (no longer accepting finalizers).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Exit, Scope } from "effect"
 * 
 * // Example of checking scope states
 * const program = Effect.gen(function*() {
 *   const scope = yield* Scope.make()
 * 
 *   // When open, the scope accepts finalizers
 *   if (scope.state._tag === "Open") {
 *     console.log("Scope is open")
 *   }
 * 
 *   yield* Scope.close(scope, Exit.void)
 * 
 *   // When closed, the scope no longer accepts finalizers
 *   if (scope.state._tag === "Closed") {
 *     console.log("Scope is closed")
 *   }
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ScopeModule from "effect/Scope";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "State";
const exportKind = "namespace";
const moduleImportPath = "effect/Scope";
const sourceSummary = "The `State` namespace contains types representing the different states a scope can be in: Open (accepting new finalizers) or Closed (no longer accepting finalizers).";
const sourceExample = "import { Effect, Exit, Scope } from \"effect\"\n\n// Example of checking scope states\nconst program = Effect.gen(function*() {\n  const scope = yield* Scope.make()\n\n  // When open, the scope accepts finalizers\n  if (scope.state._tag === \"Open\") {\n    console.log(\"Scope is open\")\n  }\n\n  yield* Scope.close(scope, Exit.void)\n\n  // When closed, the scope no longer accepts finalizers\n  if (scope.state._tag === \"Closed\") {\n    console.log(\"Scope is closed\")\n  }\n})";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
