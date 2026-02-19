/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/HelpDoc
 * Export: HelpDoc
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/HelpDoc.ts
 * Generated: 2026-02-19T04:50:46.280Z
 *
 * Overview:
 * Structured representation of help documentation for a command. This data structure is independent of formatting, allowing for different output formats (text, markdown, JSON, etc.).
 *
 * Source JSDoc Example:
 * ```ts
 * import type * as HelpDoc from "effect/unstable/cli/HelpDoc"
 *
 * const deployCommandHelp: HelpDoc.HelpDoc = {
 *   description: "Deploy your application to the cloud",
 *   usage: "myapp deploy [options] <target>",
 *   flags: [
 *     {
 *       name: "verbose",
 *       aliases: ["-v"],
 *       type: "boolean",
 *       description: "Enable verbose logging",
 *       required: false
 *     },
 *     {
 *       name: "env",
 *       aliases: ["-e"],
 *       type: "string",
 *       description: "Target environment",
 *       required: true
 *     }
 *   ],
 *   args: [
 *     {
 *       name: "target",
 *       type: "string",
 *       description: "Deployment target (e.g., 'production', 'staging')",
 *       required: true,
 *       variadic: false
 *     }
 *   ]
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as HelpDocModule from "effect/unstable/cli/HelpDoc";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "HelpDoc";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/cli/HelpDoc";
const sourceSummary =
  "Structured representation of help documentation for a command. This data structure is independent of formatting, allowing for different output formats (text, markdown, JSON, etc.).";
const sourceExample =
  'import type * as HelpDoc from "effect/unstable/cli/HelpDoc"\n\nconst deployCommandHelp: HelpDoc.HelpDoc = {\n  description: "Deploy your application to the cloud",\n  usage: "myapp deploy [options] <target>",\n  flags: [\n    {\n      name: "verbose",\n      aliases: ["-v"],\n      type: "boolean",\n      description: "Enable verbose logging",\n      required: false\n    },\n    {\n      name: "env",\n      aliases: ["-e"],\n      type: "string",\n      description: "Target environment",\n      required: true\n    }\n  ],\n  args: [\n    {\n      name: "target",\n      type: "string",\n      description: "Deployment target (e.g., \'production\', \'staging\')",\n      required: true,\n      variadic: false\n    }\n  ]\n}';
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
