/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/CliError
 * Export: isCliError
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/CliError.ts
 * Generated: 2026-02-19T04:50:46.211Z
 *
 * Overview:
 * Type guard to check if a value is a CLI error.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { CliError } from "effect/unstable/cli"
 *
 * const handleError = (error: unknown) => {
 *   if (CliError.isCliError(error)) {
 *     console.log("CLI Error:", error.message)
 *     return Effect.succeed("Handled CLI error")
 *   }
 *   return Effect.fail("Unknown error")
 * }
 *
 * // Example usage in error handling
 * const program = Effect.gen(function*() {
 *   const result = yield* Effect.try({
 *     try: () => ({ success: true }),
 *     catch: (error) => error
 *   })
 *   handleError(result)
 * })
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
import * as CliErrorModule from "effect/unstable/cli/CliError";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isCliError";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/CliError";
const sourceSummary = "Type guard to check if a value is a CLI error.";
const sourceExample =
  'import { Effect } from "effect"\nimport { CliError } from "effect/unstable/cli"\n\nconst handleError = (error: unknown) => {\n  if (CliError.isCliError(error)) {\n    console.log("CLI Error:", error.message)\n    return Effect.succeed("Handled CLI error")\n  }\n  return Effect.fail("Unknown error")\n}\n\n// Example usage in error handling\nconst program = Effect.gen(function*() {\n  const result = yield* Effect.try({\n    try: () => ({ success: true }),\n    catch: (error) => error\n  })\n  handleError(result)\n})';
const moduleRecord = CliErrorModule as Record<string, unknown>;

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
