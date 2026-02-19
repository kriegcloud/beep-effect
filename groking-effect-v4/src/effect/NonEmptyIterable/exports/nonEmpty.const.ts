/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/NonEmptyIterable
 * Export: nonEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/NonEmptyIterable.ts
 * Generated: 2026-02-19T04:14:15.182Z
 *
 * Overview:
 * A unique symbol used to brand the `NonEmptyIterable` type.
 *
 * Source JSDoc Example:
 * ```ts
 * import type * as NonEmptyIterable from "effect/NonEmptyIterable"
 *
 * // The symbol is used internally for type branding
 * declare const data: NonEmptyIterable.NonEmptyIterable<number>
 *
 * // This has the nonEmpty symbol property (not accessible at runtime)
 * // but is still a regular Iterable for all practical purposes
 * for (const item of data) {
 *   console.log(item) // Works normally
 * }
 *
 * // Can be used with any function expecting an Iterable
 * const array = Array.from(data)
 * const set = new Set(data)
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
import * as NonEmptyIterableModule from "effect/NonEmptyIterable";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "nonEmpty";
const exportKind = "const";
const moduleImportPath = "effect/NonEmptyIterable";
const sourceSummary = "A unique symbol used to brand the `NonEmptyIterable` type.";
const sourceExample =
  'import type * as NonEmptyIterable from "effect/NonEmptyIterable"\n\n// The symbol is used internally for type branding\ndeclare const data: NonEmptyIterable.NonEmptyIterable<number>\n\n// This has the nonEmpty symbol property (not accessible at runtime)\n// but is still a regular Iterable for all practical purposes\nfor (const item of data) {\n  console.log(item) // Works normally\n}\n\n// Can be used with any function expecting an Iterable\nconst array = Array.from(data)\nconst set = new Set(data)';
const moduleRecord = NonEmptyIterableModule as Record<string, unknown>;

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
