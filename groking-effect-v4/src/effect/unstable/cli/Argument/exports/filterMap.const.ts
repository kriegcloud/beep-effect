/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Argument
 * Export: filterMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Argument.ts
 * Generated: 2026-02-19T04:14:24.406Z
 *
 * Overview:
 * Filters and transforms parsed values, failing with a custom error message if the filter function returns None.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 * import { Argument } from "effect/unstable/cli"
 *
 * const positiveInt = Argument.integer("count").pipe(
 *   Argument.filterMap(
 *     (n) => n > 0 ? Option.some(n) : Option.none(),
 *     (n) => `Expected positive integer, got ${n}`
 *   )
 * )
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
import * as ArgumentModule from "effect/unstable/cli/Argument";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "filterMap";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Argument";
const sourceSummary =
  "Filters and transforms parsed values, failing with a custom error message if the filter function returns None.";
const sourceExample =
  'import { Option } from "effect"\nimport { Argument } from "effect/unstable/cli"\n\nconst positiveInt = Argument.integer("count").pipe(\n  Argument.filterMap(\n    (n) => n > 0 ? Option.some(n) : Option.none(),\n    (n) => `Expected positive integer, got ${n}`\n  )\n)';
const moduleRecord = ArgumentModule as Record<string, unknown>;

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
