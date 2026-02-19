/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/FastCheck
 * Export: PreconditionFailure
 * Kind: class
 * Source: node_modules/fast-check/lib/types/check/precondition/PreconditionFailure.d.ts
 * Generated: 2026-02-19T04:14:22.333Z
 *
 * Overview:
 * Error type produced whenever a precondition fails
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as FastCheckModule from "effect/testing/FastCheck";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "PreconditionFailure";
const exportKind = "class";
const moduleImportPath = "effect/testing/FastCheck";
const sourceSummary = "Error type produced whenever a precondition fails";
const sourceExample = "";
const moduleRecord = FastCheckModule as Record<string, unknown>;

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
