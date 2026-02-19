/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Unify
 * Export: Unify
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Unify.ts
 * Generated: 2026-02-19T04:50:44.550Z
 *
 * Overview:
 * Unifies types that implement the unification protocol.
 *
 * Source JSDoc Example:
 * ```ts
 * import type * as Unify from "effect/Unify"
 *
 * // Example of types that can be unified
 * type UnifiableA = {
 *   value: string
 *   [Unify.typeSymbol]?: string
 *   [Unify.unifySymbol]?: { String: () => string }
 * }
 *
 * type UnifiableB = {
 *   value: number
 *   [Unify.typeSymbol]?: number
 *   [Unify.unifySymbol]?: { Number: () => number }
 * }
 *
 * // Unify automatically handles the union
 * type Unified = Unify.Unify<UnifiableA | UnifiableB>
 * // Results in a properly unified type
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as UnifyModule from "effect/Unify";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Unify";
const exportKind = "type";
const moduleImportPath = "effect/Unify";
const sourceSummary = "Unifies types that implement the unification protocol.";
const sourceExample =
  'import type * as Unify from "effect/Unify"\n\n// Example of types that can be unified\ntype UnifiableA = {\n  value: string\n  [Unify.typeSymbol]?: string\n  [Unify.unifySymbol]?: { String: () => string }\n}\n\ntype UnifiableB = {\n  value: number\n  [Unify.typeSymbol]?: number\n  [Unify.unifySymbol]?: { Number: () => number }\n}\n\n// Unify automatically handles the union\ntype Unified = Unify.Unify<UnifiableA | UnifiableB>\n// Results in a properly unified type';
const moduleRecord = UnifyModule as Record<string, unknown>;

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
