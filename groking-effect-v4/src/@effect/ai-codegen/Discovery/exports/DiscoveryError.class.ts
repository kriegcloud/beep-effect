/**
 * Export Playground
 *
 * Package: @effect/ai-codegen
 * Module: @effect/ai-codegen/Discovery
 * Export: DiscoveryError
 * Kind: class
 * Source: .repos/effect-smol/packages/tools/ai-codegen/src/Discovery.ts
 * Generated: 2026-02-19T04:13:34.659Z
 *
 * Overview:
 * Error during provider discovery.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Discovery from "@effect/ai-codegen/Discovery"
 * 
 * const error = new Discovery.DiscoveryError({
 *   message: "Failed to parse config",
 *   cause: new Error("Invalid JSON")
 * })
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as DiscoveryModule from "@effect/ai-codegen/Discovery";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "DiscoveryError";
const exportKind = "class";
const moduleImportPath = "@effect/ai-codegen/Discovery";
const sourceSummary = "Error during provider discovery.";
const sourceExample = "import * as Discovery from \"@effect/ai-codegen/Discovery\"\n\nconst error = new Discovery.DiscoveryError({\n  message: \"Failed to parse config\",\n  cause: new Error(\"Invalid JSON\")\n})";
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
