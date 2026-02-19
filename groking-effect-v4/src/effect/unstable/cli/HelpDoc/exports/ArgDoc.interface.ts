/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/HelpDoc
 * Export: ArgDoc
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/HelpDoc.ts
 * Generated: 2026-02-19T04:14:24.466Z
 *
 * Overview:
 * Documentation for a positional argument
 *
 * Source JSDoc Example:
 * ```ts
 * import type { HelpDoc } from "effect/unstable/cli"
 *
 * const sourceArg: HelpDoc.ArgDoc = {
 *   name: "source",
 *   type: "file",
 *   description: "Source file to process",
 *   required: true,
 *   variadic: false
 * }
 *
 * const filesArg: HelpDoc.ArgDoc = {
 *   name: "files",
 *   type: "file",
 *   description: "Files to process (can specify multiple)",
 *   required: false,
 *   variadic: true
 * }
 *
 * // Used in command help documentation
 * const copyCommandHelp: HelpDoc.HelpDoc = {
 *   description: "Copy files from source to destination",
 *   usage: "copy <source> [files...]",
 *   flags: [],
 *   args: [sourceArg, filesArg]
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
const exportName = "ArgDoc";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/cli/HelpDoc";
const sourceSummary = "Documentation for a positional argument";
const sourceExample =
  'import type { HelpDoc } from "effect/unstable/cli"\n\nconst sourceArg: HelpDoc.ArgDoc = {\n  name: "source",\n  type: "file",\n  description: "Source file to process",\n  required: true,\n  variadic: false\n}\n\nconst filesArg: HelpDoc.ArgDoc = {\n  name: "files",\n  type: "file",\n  description: "Files to process (can specify multiple)",\n  required: false,\n  variadic: true\n}\n\n// Used in command help documentation\nconst copyCommandHelp: HelpDoc.HelpDoc = {\n  description: "Copy files from source to destination",\n  usage: "copy <source> [files...]",\n  flags: [],\n  args: [sourceArg, filesArg]\n}';
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
