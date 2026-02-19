/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Terminal
 * Export: QuitError
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/Terminal.ts
 * Generated: 2026-02-19T04:50:43.108Z
 *
 * Overview:
 * A `QuitError` represents an error that occurs when a user attempts to quit out of a `Terminal` prompt for input (usually by entering `ctrl`+`c`).
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TerminalModule from "effect/Terminal";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "QuitError";
const exportKind = "class";
const moduleImportPath = "effect/Terminal";
const sourceSummary =
  "A `QuitError` represents an error that occurs when a user attempts to quit out of a `Terminal` prompt for input (usually by entering `ctrl`+`c`).";
const sourceExample = "";
const moduleRecord = TerminalModule as Record<string, unknown>;

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
