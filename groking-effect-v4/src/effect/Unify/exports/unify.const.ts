/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Unify
 * Export: unify
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Unify.ts
 * Generated: 2026-02-19T04:14:23.520Z
 *
 * Overview:
 * Unifies the return type of a function or value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Unify } from "effect"
 *
 * // Unify a simple value
 * const unifiedValue = Unify.unify("hello")
 * // Type: string
 *
 * // Unify a function result
 * const createUnifiableValue = () => ({
 *   value: "test",
 *   [Unify.typeSymbol]: "string" as const,
 *   [Unify.unifySymbol]: { String: () => "test" as const }
 * })
 *
 * const unifiedFunction = Unify.unify(createUnifiableValue)
 * // The result will be properly unified
 *
 * // Unify with curried functions
 * const curriedFunction = (a: string) => (b: number) => ({ result: a + b })
 * const unifiedCurried = Unify.unify(curriedFunction)
 * // Type: (a: string) => (b: number) => Unify<{ result: string }>
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
import * as UnifyModule from "effect/Unify";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "unify";
const exportKind = "const";
const moduleImportPath = "effect/Unify";
const sourceSummary = "Unifies the return type of a function or value.";
const sourceExample =
  'import { Unify } from "effect"\n\n// Unify a simple value\nconst unifiedValue = Unify.unify("hello")\n// Type: string\n\n// Unify a function result\nconst createUnifiableValue = () => ({\n  value: "test",\n  [Unify.typeSymbol]: "string" as const,\n  [Unify.unifySymbol]: { String: () => "test" as const }\n})\n\nconst unifiedFunction = Unify.unify(createUnifiableValue)\n// The result will be properly unified\n\n// Unify with curried functions\nconst curriedFunction = (a: string) => (b: number) => ({ result: a + b })\nconst unifiedCurried = Unify.unify(curriedFunction)\n// Type: (a: string) => (b: number) => Unify<{ result: string }>';
const moduleRecord = UnifyModule as Record<string, unknown>;

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
