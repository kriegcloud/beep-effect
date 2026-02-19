/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Logger
 * Export: Logger
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Logger.ts
 * Generated: 2026-02-19T04:14:14.511Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Logger } from "effect"
 *
 * // Create a custom logger that accepts unknown messages and returns void
 * const stringLogger = Logger.make<unknown, void>((options) => {
 *   console.log(`[${options.logLevel}] ${options.message}`)
 * })
 *
 * // Create a logger that accepts any message type and returns a formatted string
 * const formattedLogger = Logger.make<unknown, string>((options) =>
 *   `${options.date.toISOString()} [${options.logLevel}] ${options.message}`
 * )
 *
 * // Use the logger in an Effect program
 * const program = Effect.log("Hello World").pipe(
 *   Effect.provide(Logger.layer([stringLogger]))
 * )
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
import * as LoggerModule from "effect/Logger";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Logger";
const exportKind = "interface";
const moduleImportPath = "effect/Logger";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample =
  'import { Effect, Logger } from "effect"\n\n// Create a custom logger that accepts unknown messages and returns void\nconst stringLogger = Logger.make<unknown, void>((options) => {\n  console.log(`[${options.logLevel}] ${options.message}`)\n})\n\n// Create a logger that accepts any message type and returns a formatted string\nconst formattedLogger = Logger.make<unknown, string>((options) =>\n  `${options.date.toISOString()} [${options.logLevel}] ${options.message}`\n)\n\n// Use the logger in an Effect program\nconst program = Effect.log("Hello World").pipe(\n  Effect.provide(Logger.layer([stringLogger]))\n)';
const moduleRecord = LoggerModule as Record<string, unknown>;

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
