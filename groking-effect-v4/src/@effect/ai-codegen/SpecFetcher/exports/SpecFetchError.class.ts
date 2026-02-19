/**
 * Export Playground
 *
 * Package: @effect/ai-codegen
 * Module: @effect/ai-codegen/SpecFetcher
 * Export: SpecFetchError
 * Kind: class
 * Source: .repos/effect-smol/packages/tools/ai-codegen/src/SpecFetcher.ts
 * Generated: 2026-02-19T04:13:34.700Z
 *
 * Overview:
 * Error when fetching a spec fails.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as SpecFetcher from "@effect/ai-codegen/SpecFetcher"
 * 
 * const error = new SpecFetcher.SpecFetchError({
 *   provider: "openai",
 *   source: "https://example.com/openapi.json",
 *   cause: new Error("Network error")
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
import * as SpecFetcherModule from "@effect/ai-codegen/SpecFetcher";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "SpecFetchError";
const exportKind = "class";
const moduleImportPath = "@effect/ai-codegen/SpecFetcher";
const sourceSummary = "Error when fetching a spec fails.";
const sourceExample = "import * as SpecFetcher from \"@effect/ai-codegen/SpecFetcher\"\n\nconst error = new SpecFetcher.SpecFetchError({\n  provider: \"openai\",\n  source: \"https://example.com/openapi.json\",\n  cause: new Error(\"Network error\")\n})";
const moduleRecord = SpecFetcherModule as Record<string, unknown>;

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
