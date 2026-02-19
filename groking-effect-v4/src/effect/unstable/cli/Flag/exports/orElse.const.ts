/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Flag
 * Export: orElse
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Flag.ts
 * Generated: 2026-02-19T04:14:24.461Z
 *
 * Overview:
 * Provides an alternative flag if the first one fails to parse.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Flag } from "effect/unstable/cli"
 *
 * // Try parsing as integer, fallback to string
 * const valueFlag = Flag.orElse(
 *   Flag.integer("value"),
 *   () => Flag.string("value")
 * )
 *
 * // Multiple input sources with fallback
 * const configFlag = Flag.orElse(
 *   Flag.file("config"),
 *   () => Flag.string("config-url")
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
const exportName = "orElse";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Flag";
const sourceSummary = "Provides an alternative flag if the first one fails to parse.";
const sourceExample =
  'import { Flag } from "effect/unstable/cli"\n\n// Try parsing as integer, fallback to string\nconst valueFlag = Flag.orElse(\n  Flag.integer("value"),\n  () => Flag.string("value")\n)\n\n// Multiple input sources with fallback\nconst configFlag = Flag.orElse(\n  Flag.file("config"),\n  () => Flag.string("config-url")\n)';
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
