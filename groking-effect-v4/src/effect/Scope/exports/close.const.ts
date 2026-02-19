/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Scope
 * Export: close
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Scope.ts
 * Generated: 2026-02-19T04:14:20.123Z
 *
 * Overview:
 * Closes a scope, running all registered finalizers in the appropriate order. The exit value is passed to each finalizer.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Exit, Scope } from "effect"
 * 
 * const resourceManagement = Effect.gen(function*() {
 *   const scope = yield* Scope.make("sequential")
 * 
 *   // Add multiple finalizers
 *   yield* Scope.addFinalizer(scope, Console.log("Close database connection"))
 *   yield* Scope.addFinalizer(scope, Console.log("Close file handle"))
 *   yield* Scope.addFinalizer(scope, Console.log("Release memory"))
 * 
 *   // Do some work...
 *   yield* Console.log("Performing operations...")
 * 
 *   // Close scope - finalizers run in reverse order of registration
 *   yield* Scope.close(scope, Exit.succeed("Success!"))
 *   // Output: "Release memory", "Close file handle", "Close database connection"
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
const exportName = "close";
const exportKind = "const";
const moduleImportPath = "effect/Scope";
const sourceSummary = "Closes a scope, running all registered finalizers in the appropriate order. The exit value is passed to each finalizer.";
const sourceExample = "import { Console, Effect, Exit, Scope } from \"effect\"\n\nconst resourceManagement = Effect.gen(function*() {\n  const scope = yield* Scope.make(\"sequential\")\n\n  // Add multiple finalizers\n  yield* Scope.addFinalizer(scope, Console.log(\"Close database connection\"))\n  yield* Scope.addFinalizer(scope, Console.log(\"Close file handle\"))\n  yield* Scope.addFinalizer(scope, Console.log(\"Release memory\"))\n\n  // Do some work...\n  yield* Console.log(\"Performing operations...\")\n\n  // Close scope - finalizers run in reverse order of registration\n  yield* Scope.close(scope, Exit.succeed(\"Success!\"))\n  // Output: \"Release memory\", \"Close file handle\", \"Close database connection\"\n})";
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
