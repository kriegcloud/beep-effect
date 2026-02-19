/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Prompt
 * Export: FilePart
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Prompt.ts
 * Generated: 2026-02-19T04:14:24.059Z
 *
 * Overview:
 * Content part representing a file attachment. Files can be provided as base64 strings of data, byte arrays, or URLs.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const imagePart: Prompt.FilePart = Prompt.makePart("file", {
 *   mediaType: "image/jpeg",
 *   fileName: "photo.jpg",
 *   data: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
 * })
 *
 * const documentPart: Prompt.FilePart = Prompt.makePart("file", {
 *   mediaType: "application/pdf",
 *   fileName: "report.pdf",
 *   data: new Uint8Array([1, 2, 3])
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as PromptModule from "effect/unstable/ai/Prompt";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "FilePart";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/ai/Prompt";
const sourceSummary =
  "Content part representing a file attachment. Files can be provided as base64 strings of data, byte arrays, or URLs.";
const sourceExample =
  'import { Prompt } from "effect/unstable/ai"\n\nconst imagePart: Prompt.FilePart = Prompt.makePart("file", {\n  mediaType: "image/jpeg",\n  fileName: "photo.jpg",\n  data: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."\n})\n\nconst documentPart: Prompt.FilePart = Prompt.makePart("file", {\n  mediaType: "application/pdf",\n  fileName: "report.pdf",\n  data: new Uint8Array([1, 2, 3])\n})';
const moduleRecord = PromptModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
