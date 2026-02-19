/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/HelpDoc
 * Export: SubcommandDoc
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/HelpDoc.ts
 * Generated: 2026-02-19T04:14:24.466Z
 *
 * Overview:
 * Documentation for a subcommand
 *
 * Source JSDoc Example:
 * ```ts
 * import type { HelpDoc } from "effect/unstable/cli"
 *
 * const deploySubcommand: HelpDoc.SubcommandDoc = {
 *   name: "deploy",
 *   description: "Deploy the application to the cloud"
 * }
 *
 * const buildSubcommand: HelpDoc.SubcommandDoc = {
 *   name: "build",
 *   description: "Build the application for production"
 * }
 *
 * // Used in parent command's help documentation
 * const mainCommandHelp: HelpDoc.HelpDoc = {
 *   description: "Cloud deployment tool",
 *   usage: "myapp <command> [options]",
 *   flags: [],
 *   subcommands: [deploySubcommand, buildSubcommand]
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
const exportName = "SubcommandDoc";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/cli/HelpDoc";
const sourceSummary = "Documentation for a subcommand";
const sourceExample =
  'import type { HelpDoc } from "effect/unstable/cli"\n\nconst deploySubcommand: HelpDoc.SubcommandDoc = {\n  name: "deploy",\n  description: "Deploy the application to the cloud"\n}\n\nconst buildSubcommand: HelpDoc.SubcommandDoc = {\n  name: "build",\n  description: "Build the application for production"\n}\n\n// Used in parent command\'s help documentation\nconst mainCommandHelp: HelpDoc.HelpDoc = {\n  description: "Cloud deployment tool",\n  usage: "myapp <command> [options]",\n  flags: [],\n  subcommands: [deploySubcommand, buildSubcommand]\n}';
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
