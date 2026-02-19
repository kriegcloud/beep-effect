/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Flag
 * Export: withMetavar
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Flag.ts
 * Generated: 2026-02-19T04:14:24.462Z
 *
 * Overview:
 * Sets a custom metavar (placeholder name) for the flag in help documentation.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Flag } from "effect/unstable/cli"
 *
 * const databaseFlag = Flag.string("database-url").pipe(
 *   Flag.withMetavar("URL"),
 *   Flag.withDescription("Database connection URL")
 * )
 * // In help: --database-url URL
 *
 * const timeoutFlag = Flag.integer("timeout").pipe(
 *   Flag.withMetavar("SECONDS")
 * )
 * // In help: --timeout SECONDS
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
const exportName = "withMetavar";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Flag";
const sourceSummary = "Sets a custom metavar (placeholder name) for the flag in help documentation.";
const sourceExample =
  'import { Flag } from "effect/unstable/cli"\n\nconst databaseFlag = Flag.string("database-url").pipe(\n  Flag.withMetavar("URL"),\n  Flag.withDescription("Database connection URL")\n)\n// In help: --database-url URL\n\nconst timeoutFlag = Flag.integer("timeout").pipe(\n  Flag.withMetavar("SECONDS")\n)\n// In help: --timeout SECONDS';
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
