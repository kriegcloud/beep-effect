/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/CliError
 * Export: CliError
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/CliError.ts
 * Generated: 2026-02-19T04:14:24.413Z
 *
 * Overview:
 * Union type representing all possible CLI error conditions.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { CliError } from "effect/unstable/cli"
 *
 * const handleCliError = (error: CliError.CliError): void => {
 *   switch (error._tag) {
 *     case "UnrecognizedOption":
 *       console.log(`Unknown flag: ${error.option}`)
 *       break
 *     case "MissingOption":
 *       console.log(`Required flag missing: ${error.option}`)
 *       break
 *     case "InvalidValue":
 *       console.log(`Invalid value: ${error.value} for ${error.option}`)
 *       break
 *     case "ShowHelp":
 *       // Display help for the command path
 *       console.log(`Help requested for: ${error.commandPath.join(" ")}`)
 *       break
 *     default:
 *       console.log(error.message)
 *   }
 * }
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as CliErrorModule from "effect/unstable/cli/CliError";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "CliError";
const exportKind = "type";
const moduleImportPath = "effect/unstable/cli/CliError";
const sourceSummary = "Union type representing all possible CLI error conditions.";
const sourceExample =
  'import type { CliError } from "effect/unstable/cli"\n\nconst handleCliError = (error: CliError.CliError): void => {\n  switch (error._tag) {\n    case "UnrecognizedOption":\n      console.log(`Unknown flag: ${error.option}`)\n      break\n    case "MissingOption":\n      console.log(`Required flag missing: ${error.option}`)\n      break\n    case "InvalidValue":\n      console.log(`Invalid value: ${error.value} for ${error.option}`)\n      break\n    case "ShowHelp":\n      // Display help for the command path\n      console.log(`Help requested for: ${error.commandPath.join(" ")}`)\n      break\n    default:\n      console.log(error.message)\n  }\n}';
const moduleRecord = CliErrorModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
