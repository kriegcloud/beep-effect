/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/CliError
 * Export: ShowHelp
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/CliError.ts
 * Generated: 2026-02-19T04:14:24.414Z
 *
 * Overview:
 * Control flow indicator when help is requested via --help flag. This is not an error but uses the error channel for control flow.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { CliError } from "effect/unstable/cli"
 * 
 * const showHelpIndicator = new CliError.ShowHelp({
 *   commandPath: ["myapp", "deploy", "production"]
 * })
 * 
 * console.log(showHelpIndicator.message)
 * // "Help requested"
 * 
 * // In help flag handling
 * const handleHelpFlag = (hasHelpFlag: boolean) =>
 *   Effect.gen(function*() {
 *     if (hasHelpFlag) {
 *       return yield* Effect.fail(showHelpIndicator)
 *     }
 *     return "continuing with command"
 *   })
 * 
 * // In error handling
 * const handleCliErrors = (error: CliError.CliError): void => {
 *   if (error._tag === "ShowHelp") {
 *     // Display help for the command path
 *     console.log(`Displaying help for: ${error.commandPath.join(" ")}`)
 *   }
 *   // Handle other errors...
 * }
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CliErrorModule from "effect/unstable/cli/CliError";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ShowHelp";
const exportKind = "class";
const moduleImportPath = "effect/unstable/cli/CliError";
const sourceSummary = "Control flow indicator when help is requested via --help flag. This is not an error but uses the error channel for control flow.";
const sourceExample = "import { Effect } from \"effect\"\nimport { CliError } from \"effect/unstable/cli\"\n\nconst showHelpIndicator = new CliError.ShowHelp({\n  commandPath: [\"myapp\", \"deploy\", \"production\"]\n})\n\nconsole.log(showHelpIndicator.message)\n// \"Help requested\"\n\n// In help flag handling\nconst handleHelpFlag = (hasHelpFlag: boolean) =>\n  Effect.gen(function*() {\n    if (hasHelpFlag) {\n      return yield* Effect.fail(showHelpIndicator)\n    }\n    return \"continuing with command\"\n  })\n\n// In error handling\nconst handleCliErrors = (error: CliError.CliError): void => {\n  if (error._tag === \"ShowHelp\") {\n    // Display help for the command path\n    console.log(`Displaying help for: ${error.commandPath.join(\" \")}`)\n  }\n  // Handle other errors...\n}";
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
      run: exampleClassDiscovery
    },
    {
      title: "Zero-Arg Construction Probe",
      description: "Attempt construction and report constructor behavior.",
      run: exampleConstructionProbe
    }
  ]
});

BunRuntime.runMain(program);
