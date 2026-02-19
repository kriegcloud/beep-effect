/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ConfigProvider
 * Export: SourceError
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/ConfigProvider.ts
 * Generated: 2026-02-19T04:14:11.183Z
 *
 * Overview:
 * Typed error indicating that a configuration source could not be read.
 *
 * Source JSDoc Example:
 * ```ts
 * import { ConfigProvider, Effect } from "effect"
 * 
 * const provider = ConfigProvider.make((_path) =>
 *   Effect.fail(
 *     new ConfigProvider.SourceError({ message: "connection refused" })
 *   )
 * )
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ConfigProviderModule from "effect/ConfigProvider";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "SourceError";
const exportKind = "class";
const moduleImportPath = "effect/ConfigProvider";
const sourceSummary = "Typed error indicating that a configuration source could not be read.";
const sourceExample = "import { ConfigProvider, Effect } from \"effect\"\n\nconst provider = ConfigProvider.make((_path) =>\n  Effect.fail(\n    new ConfigProvider.SourceError({ message: \"connection refused\" })\n  )\n)";
const moduleRecord = ConfigProviderModule as Record<string, unknown>;

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
