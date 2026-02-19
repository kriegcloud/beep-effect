/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cluster/RunnerStorage
 * Export: RunnerStorage
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/cluster/RunnerStorage.ts
 * Generated: 2026-02-19T04:14:25.235Z
 *
 * Overview:
 * Represents a generic interface to the persistent storage required by the cluster.
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
import * as RunnerStorageModule from "effect/unstable/cluster/RunnerStorage";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "RunnerStorage";
const exportKind = "class";
const moduleImportPath = "effect/unstable/cluster/RunnerStorage";
const sourceSummary = "Represents a generic interface to the persistent storage required by the cluster.";
const sourceExample = "";
const moduleRecord = RunnerStorageModule as Record<string, unknown>;

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
