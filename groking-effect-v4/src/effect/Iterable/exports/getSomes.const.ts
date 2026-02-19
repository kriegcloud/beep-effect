/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: getSomes
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.235Z
 *
 * Overview:
 * Retrieves the `Some` values from an `Iterable` of `Option`s.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 * import * as Option from "effect/Option"
 * import * as assert from "node:assert"
 * 
 * assert.deepStrictEqual(
 *   Array.from(
 *     Iterable.getSomes([Option.some(1), Option.none(), Option.some(2)])
 *   ),
 *   [1, 2]
 * )
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
import * as IterableModule from "effect/Iterable";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getSomes";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Retrieves the `Some` values from an `Iterable` of `Option`s.";
const sourceExample = "import { Iterable } from \"effect\"\nimport * as Option from \"effect/Option\"\nimport * as assert from \"node:assert\"\n\nassert.deepStrictEqual(\n  Array.from(\n    Iterable.getSomes([Option.some(1), Option.none(), Option.some(2)])\n  ),\n  [1, 2]\n)";
const moduleRecord = IterableModule as Record<string, unknown>;

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
