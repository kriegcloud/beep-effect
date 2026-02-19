/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HKT
 * Export: URI
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HKT.ts
 * Generated: 2026-02-19T04:14:14.182Z
 *
 * Overview:
 * A unique symbol used to identify TypeClass implementations.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { HKT } from "effect"
 *
 * interface MyTypeClass<F extends HKT.TypeLambda> extends HKT.TypeClass<F> {
 *   // TypeClass methods here
 * }
 *
 * // The URI symbol helps TypeScript understand the relationship
 * // between the type class and its type lambda
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
import * as HKTModule from "effect/HKT";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "URI";
const exportKind = "const";
const moduleImportPath = "effect/HKT";
const sourceSummary = "A unique symbol used to identify TypeClass implementations.";
const sourceExample =
  'import type { HKT } from "effect"\n\ninterface MyTypeClass<F extends HKT.TypeLambda> extends HKT.TypeClass<F> {\n  // TypeClass methods here\n}\n\n// The URI symbol helps TypeScript understand the relationship\n// between the type class and its type lambda';
const moduleRecord = HKTModule as Record<string, unknown>;

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
