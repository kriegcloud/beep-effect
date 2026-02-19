/**
 * Export Playground
 *
 * Package: @effect/ai-codegen
 * Module: @effect/ai-codegen/Discovery
 * Export: ProviderNotFoundError
 * Kind: class
 * Source: .repos/effect-smol/packages/tools/ai-codegen/src/Discovery.ts
 * Generated: 2026-02-19T04:13:34.659Z
 *
 * Overview:
 * Error when a specific provider is not found.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Discovery from "@effect/ai-codegen/Discovery"
 *
 * const error = new Discovery.ProviderNotFoundError({
 *   provider: "openai",
 *   available: ["anthropic", "google"]
 * })
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
import * as DiscoveryModule from "@effect/ai-codegen/Discovery";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ProviderNotFoundError";
const exportKind = "class";
const moduleImportPath = "@effect/ai-codegen/Discovery";
const sourceSummary = "Error when a specific provider is not found.";
const sourceExample =
  'import * as Discovery from "@effect/ai-codegen/Discovery"\n\nconst error = new Discovery.ProviderNotFoundError({\n  provider: "openai",\n  available: ["anthropic", "google"]\n})';
const moduleRecord = DiscoveryModule as Record<string, unknown>;

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
