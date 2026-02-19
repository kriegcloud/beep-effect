/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cluster/RunnerHealth
 * Export: RunnerHealth
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/cluster/RunnerHealth.ts
 * Generated: 2026-02-19T04:14:25.202Z
 *
 * Overview:
 * Represents the service used to check if a Runner is healthy.
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
import * as RunnerHealthModule from "effect/unstable/cluster/RunnerHealth";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "RunnerHealth";
const exportKind = "class";
const moduleImportPath = "effect/unstable/cluster/RunnerHealth";
const sourceSummary = "Represents the service used to check if a Runner is healthy.";
const sourceExample = "";
const moduleRecord = RunnerHealthModule as Record<string, unknown>;

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
