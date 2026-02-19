/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Symbol
 * Export: isSymbol
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Symbol.ts
 * Generated: 2026-02-19T04:14:21.910Z
 *
 * Overview:
 * Tests if a value is a `symbol`.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Predicate from "effect/Predicate"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(Predicate.isSymbol(Symbol.for("a")), true)
 * assert.deepStrictEqual(Predicate.isSymbol("a"), false)
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
import * as SymbolModule from "effect/Symbol";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isSymbol";
const exportKind = "const";
const moduleImportPath = "effect/Symbol";
const sourceSummary = "Tests if a value is a `symbol`.";
const sourceExample =
  'import * as Predicate from "effect/Predicate"\nimport * as assert from "node:assert"\n\nassert.deepStrictEqual(Predicate.isSymbol(Symbol.for("a")), true)\nassert.deepStrictEqual(Predicate.isSymbol("a"), false)';
const moduleRecord = SymbolModule as Record<string, unknown>;

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
