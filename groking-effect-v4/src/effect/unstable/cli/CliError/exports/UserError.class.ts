/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/CliError
 * Export: UserError
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/CliError.ts
 * Generated: 2026-02-19T04:14:24.414Z
 *
 * Overview:
 * Wrapper for user (handler) errors to unify under CLI error channel when desired.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { CliError } from "effect/unstable/cli"
 *
 * // Wrapping user errors
 * const userError = new CliError.UserError({
 *   cause: new Error("Database connection failed")
 * })
 *
 * // In command handler
 * const deployCommand = Effect.gen(function*() {
 *   const result = yield* Effect.try({
 *     try: () => ({ deployed: true }),
 *     catch: (error) => new CliError.UserError({ cause: error })
 *   })
 *   return result
 * })
 *
 * // In error handling
 * const handleError = (error: CliError.CliError): Effect.Effect<number> => {
 *   if (error._tag === "UserError") {
 *     console.log("Command failed:", error.cause)
 *     return Effect.succeed(1) // Exit code 1
 *   }
 *   return Effect.succeed(0)
 * }
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as CliErrorModule from "effect/unstable/cli/CliError";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "UserError";
const exportKind = "class";
const moduleImportPath = "effect/unstable/cli/CliError";
const sourceSummary = "Wrapper for user (handler) errors to unify under CLI error channel when desired.";
const sourceExample =
  'import { Effect } from "effect"\nimport { CliError } from "effect/unstable/cli"\n\n// Wrapping user errors\nconst userError = new CliError.UserError({\n  cause: new Error("Database connection failed")\n})\n\n// In command handler\nconst deployCommand = Effect.gen(function*() {\n  const result = yield* Effect.try({\n    try: () => ({ deployed: true }),\n    catch: (error) => new CliError.UserError({ cause: error })\n  })\n  return result\n})\n\n// In error handling\nconst handleError = (error: CliError.CliError): Effect.Effect<number> => {\n  if (error._tag === "UserError") {\n    console.log("Command failed:", error.cause)\n    return Effect.succeed(1) // Exit code 1\n  }\n  return Effect.succeed(0)\n}';
const moduleRecord = CliErrorModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleClassDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata and class-like surface information.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleConstructionProbe = Effect.gen(function* () {
  yield* Console.log("Attempt a zero-arg construction probe.");
  yield* probeNamedExportConstructor({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧱",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Class Discovery",
      description: "Inspect runtime shape and discover class metadata.",
      run: exampleClassDiscovery,
    },
    {
      title: "Zero-Arg Construction Probe",
      description: "Attempt construction and report constructor behavior.",
      run: exampleConstructionProbe,
    },
  ],
});

BunRuntime.runMain(program);
