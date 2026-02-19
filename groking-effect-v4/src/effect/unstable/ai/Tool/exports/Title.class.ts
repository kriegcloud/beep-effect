/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Tool
 * Export: Title
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Tool.ts
 * Generated: 2026-02-19T04:14:24.148Z
 *
 * Overview:
 * Annotation for providing a human-readable title for tools.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Tool } from "effect/unstable/ai"
 *
 * const myTool = Tool.make("calculate_tip")
 *   .annotate(Tool.Title, "Tip Calculator")
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ToolModule from "effect/unstable/ai/Tool";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Title";
const exportKind = "class";
const moduleImportPath = "effect/unstable/ai/Tool";
const sourceSummary = "Annotation for providing a human-readable title for tools.";
const sourceExample =
  'import { Tool } from "effect/unstable/ai"\n\nconst myTool = Tool.make("calculate_tip")\n  .annotate(Tool.Title, "Tip Calculator")';
const moduleRecord = ToolModule as Record<string, unknown>;

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
