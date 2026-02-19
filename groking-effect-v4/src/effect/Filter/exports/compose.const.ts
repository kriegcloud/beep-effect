/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Filter
 * Export: compose
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Filter.ts
 * Generated: 2026-02-19T04:50:36.481Z
 *
 * Overview:
 * Composes two filters sequentially, feeding the output of the first into the second.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Filter, Result } from "effect"
 *
 * const stringFilter = Filter.string
 * const nonEmptyUpper = Filter.make((s: string) =>
 *   s.length > 0 ? Result.succeed(s.toUpperCase()) : Result.fail(s)
 * )
 *
 * const stringToUpper = Filter.compose(stringFilter, nonEmptyUpper)
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FilterModule from "effect/Filter";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "compose";
const exportKind = "const";
const moduleImportPath = "effect/Filter";
const sourceSummary = "Composes two filters sequentially, feeding the output of the first into the second.";
const sourceExample =
  'import { Filter, Result } from "effect"\n\nconst stringFilter = Filter.string\nconst nonEmptyUpper = Filter.make((s: string) =>\n  s.length > 0 ? Result.succeed(s.toUpperCase()) : Result.fail(s)\n)\n\nconst stringToUpper = Filter.compose(stringFilter, nonEmptyUpper)';
const moduleRecord = FilterModule as Record<string, unknown>;

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
