/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Flag
 * Export: filter
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Flag.ts
 * Generated: 2026-02-19T04:14:24.461Z
 *
 * Overview:
 * Filters a flag value based on a predicate, failing with a custom error if the predicate returns false.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Flag } from "effect/unstable/cli"
 *
 * // Ensure port is in valid range
 * const portFlag = Flag.integer("port").pipe(
 *   Flag.filter(
 *     (port) => port >= 1 && port <= 65535,
 *     (port) => `Port ${port} is out of range (1-65535)`
 *   )
 * )
 *
 * // Ensure non-empty string
 * const nameFlag = Flag.string("name").pipe(
 *   Flag.filter(
 *     (name) => name.trim().length > 0,
 *     () => "Name cannot be empty"
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
import * as FlagModule from "effect/unstable/cli/Flag";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "filter";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Flag";
const sourceSummary =
  "Filters a flag value based on a predicate, failing with a custom error if the predicate returns false.";
const sourceExample =
  'import { Flag } from "effect/unstable/cli"\n\n// Ensure port is in valid range\nconst portFlag = Flag.integer("port").pipe(\n  Flag.filter(\n    (port) => port >= 1 && port <= 65535,\n    (port) => `Port ${port} is out of range (1-65535)`\n  )\n)\n\n// Ensure non-empty string\nconst nameFlag = Flag.string("name").pipe(\n  Flag.filter(\n    (name) => name.trim().length > 0,\n    () => "Name cannot be empty"\n  )\n)';
const moduleRecord = FlagModule as Record<string, unknown>;

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
