/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Redacted
 * Export: Redacted
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Redacted.ts
 * Generated: 2026-02-19T04:14:16.296Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Redacted } from "effect"
 *
 * // Create a redacted value to protect sensitive information
 * const apiKey = Redacted.make("secret-key")
 * const userPassword = Redacted.make("user-password")
 *
 * // TypeScript will infer the types as Redacted<string>
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
import * as RedactedModule from "effect/Redacted";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Redacted";
const exportKind = "interface";
const moduleImportPath = "effect/Redacted";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample =
  'import { Redacted } from "effect"\n\n// Create a redacted value to protect sensitive information\nconst apiKey = Redacted.make("secret-key")\nconst userPassword = Redacted.make("user-password")\n\n// TypeScript will infer the types as Redacted<string>';
const moduleRecord = RedactedModule as Record<string, unknown>;

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
