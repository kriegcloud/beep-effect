/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: forEach
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.388Z
 *
 * Overview:
 * Executes an effectful operation for each element in an `Iterable`.
 *
 * Source JSDoc Example:
 * ```ts
 * // Title: Applying Effects to Iterable Elements
 * import { Effect } from "effect"
 * import { Console } from "effect"
 * 
 * const result = Effect.forEach(
 *   [1, 2, 3, 4, 5],
 *   (n, index) =>
 *     Console.log(`Currently at index ${index}`).pipe(Effect.as(n * 2))
 * )
 * 
 * Effect.runPromise(result).then(console.log)
 * // Output:
 * // Currently at index 0
 * // Currently at index 1
 * // Currently at index 2
 * // Currently at index 3
 * // Currently at index 4
 * // [ 2, 4, 6, 8, 10 ]
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
import * as EffectModule from "effect/Effect";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "forEach";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Executes an effectful operation for each element in an `Iterable`.";
const sourceExample = "// Title: Applying Effects to Iterable Elements\nimport { Effect } from \"effect\"\nimport { Console } from \"effect\"\n\nconst result = Effect.forEach(\n  [1, 2, 3, 4, 5],\n  (n, index) =>\n    Console.log(`Currently at index ${index}`).pipe(Effect.as(n * 2))\n)\n\nEffect.runPromise(result).then(console.log)\n// Output:\n// Currently at index 0\n// Currently at index 1\n// Currently at index 2\n// Currently at index 3\n// Currently at index 4\n// [ 2, 4, 6, 8, 10 ]";
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
