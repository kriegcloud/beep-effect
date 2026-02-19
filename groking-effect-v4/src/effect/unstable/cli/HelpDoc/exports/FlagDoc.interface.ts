/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/HelpDoc
 * Export: FlagDoc
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/HelpDoc.ts
 * Generated: 2026-02-19T04:14:24.466Z
 *
 * Overview:
 * Documentation for a single command-line flag/option
 *
 * Source JSDoc Example:
 * ```ts
 * import type { HelpDoc } from "effect/unstable/cli"
 *
 * const verboseFlag: HelpDoc.FlagDoc = {
 *   name: "verbose",
 *   aliases: ["-v", "--verbose"],
 *   type: "boolean",
 *   description: "Enable verbose output",
 *   required: false
 * }
 *
 * const portFlag: HelpDoc.FlagDoc = {
 *   name: "port",
 *   aliases: ["-p"],
 *   type: "integer",
 *   description: "Port number to use",
 *   required: true
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
import * as HelpDocModule from "effect/unstable/cli/HelpDoc";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "FlagDoc";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/cli/HelpDoc";
const sourceSummary = "Documentation for a single command-line flag/option";
const sourceExample =
  'import type { HelpDoc } from "effect/unstable/cli"\n\nconst verboseFlag: HelpDoc.FlagDoc = {\n  name: "verbose",\n  aliases: ["-v", "--verbose"],\n  type: "boolean",\n  description: "Enable verbose output",\n  required: false\n}\n\nconst portFlag: HelpDoc.FlagDoc = {\n  name: "port",\n  aliases: ["-p"],\n  type: "integer",\n  description: "Port number to use",\n  required: true\n}';
const moduleRecord = HelpDocModule as Record<string, unknown>;

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
