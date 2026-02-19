/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: scope
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.394Z
 *
 * Overview:
 * Returns the current scope for resource management.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const currentScope = yield* Effect.scope
 *   yield* Console.log("Got scope for resource management")
 *
 *   // Use the scope to manually manage resources if needed
 *   const resource = yield* Effect.acquireRelease(
 *     Console.log("Acquiring resource").pipe(Effect.as("resource")),
 *     () => Console.log("Releasing resource")
 *   )
 *
 *   return resource
 * })
 *
 * Effect.runPromise(Effect.scoped(program)).then(console.log)
 * // Output:
 * // Got scope for resource management
 * // Acquiring resource
 * // resource
 * // Releasing resource
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "scope";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Returns the current scope for resource management.";
const sourceExample =
  'import { Console, Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  const currentScope = yield* Effect.scope\n  yield* Console.log("Got scope for resource management")\n\n  // Use the scope to manually manage resources if needed\n  const resource = yield* Effect.acquireRelease(\n    Console.log("Acquiring resource").pipe(Effect.as("resource")),\n    () => Console.log("Releasing resource")\n  )\n\n  return resource\n})\n\nEffect.runPromise(Effect.scoped(program)).then(console.log)\n// Output:\n// Got scope for resource management\n// Acquiring resource\n// resource\n// Releasing resource';
const moduleRecord = EffectModule as Record<string, unknown>;

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
