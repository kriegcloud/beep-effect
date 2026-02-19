/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Unify
 * Export: typeSymbol
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Unify.ts
 * Generated: 2026-02-19T04:14:23.520Z
 *
 * Overview:
 * A unique symbol used to identify the type information for unification.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Unify } from "effect"
 *
 * // The typeSymbol is used internally in Effect types
 * // to store type information for unification
 * declare const effect: {
 *   readonly [Unify.typeSymbol]?: any
 * }
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
const exportName = "typeSymbol";
const exportKind = "const";
const moduleImportPath = "effect/Unify";
const sourceSummary = "A unique symbol used to identify the type information for unification.";
const sourceExample =
  'import type { Unify } from "effect"\n\n// The typeSymbol is used internally in Effect types\n// to store type information for unification\ndeclare const effect: {\n  readonly [Unify.typeSymbol]?: any\n}';
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
