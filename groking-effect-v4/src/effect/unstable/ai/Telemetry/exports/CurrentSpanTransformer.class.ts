/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Telemetry
 * Export: CurrentSpanTransformer
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Telemetry.ts
 * Generated: 2026-02-19T04:14:24.111Z
 *
 * Overview:
 * Service key for providing a span transformer to large langauge model operations.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TelemetryModule from "effect/unstable/ai/Telemetry";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "CurrentSpanTransformer";
const exportKind = "class";
const moduleImportPath = "effect/unstable/ai/Telemetry";
const sourceSummary = "Service key for providing a span transformer to large langauge model operations.";
const sourceExample = "";
const moduleRecord = TelemetryModule as Record<string, unknown>;

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
