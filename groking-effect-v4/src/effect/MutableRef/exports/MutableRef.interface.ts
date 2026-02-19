/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableRef
 * Export: MutableRef
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/MutableRef.ts
 * Generated: 2026-02-19T04:14:15.176Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableRef } from "effect"
 *
 * // Create a mutable reference
 * const ref: MutableRef.MutableRef<number> = MutableRef.make(42)
 *
 * // Read the current value
 * console.log(ref.current) // 42
 * console.log(MutableRef.get(ref)) // 42
 *
 * // Update the value
 * ref.current = 100
 * console.log(MutableRef.get(ref)) // 100
 *
 * // Use with complex types
 * interface Config {
 *   timeout: number
 *   retries: number
 * }
 *
 * const config: MutableRef.MutableRef<Config> = MutableRef.make({
 *   timeout: 5000,
 *   retries: 3
 * })
 *
 * // Update through the interface
 * config.current = { timeout: 10000, retries: 5 }
 * console.log(config.current.timeout) // 10000
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
import * as MutableRefModule from "effect/MutableRef";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "MutableRef";
const exportKind = "interface";
const moduleImportPath = "effect/MutableRef";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample =
  'import { MutableRef } from "effect"\n\n// Create a mutable reference\nconst ref: MutableRef.MutableRef<number> = MutableRef.make(42)\n\n// Read the current value\nconsole.log(ref.current) // 42\nconsole.log(MutableRef.get(ref)) // 42\n\n// Update the value\nref.current = 100\nconsole.log(MutableRef.get(ref)) // 100\n\n// Use with complex types\ninterface Config {\n  timeout: number\n  retries: number\n}\n\nconst config: MutableRef.MutableRef<Config> = MutableRef.make({\n  timeout: 5000,\n  retries: 3\n})\n\n// Update through the interface\nconfig.current = { timeout: 10000, retries: 5 }\nconsole.log(config.current.timeout) // 10000';
const moduleRecord = MutableRefModule as Record<string, unknown>;

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
