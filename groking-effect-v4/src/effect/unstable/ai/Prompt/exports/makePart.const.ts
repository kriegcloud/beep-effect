/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Prompt
 * Export: makePart
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Prompt.ts
 * Generated: 2026-02-19T04:14:24.059Z
 *
 * Overview:
 * Creates a new content part of the specified type.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const textPart = Prompt.makePart("text", {
 *   text: "Hello, world!"
 * })
 *
 * const filePart = Prompt.makePart("file", {
 *   mediaType: "image/png",
 *   fileName: "screenshot.png",
 *   data: new Uint8Array([1, 2, 3])
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as PromptModule from "effect/unstable/ai/Prompt";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makePart";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/Prompt";
const sourceSummary = "Creates a new content part of the specified type.";
const sourceExample =
  'import { Prompt } from "effect/unstable/ai"\n\nconst textPart = Prompt.makePart("text", {\n  text: "Hello, world!"\n})\n\nconst filePart = Prompt.makePart("file", {\n  mediaType: "image/png",\n  fileName: "screenshot.png",\n  data: new Uint8Array([1, 2, 3])\n})';
const moduleRecord = PromptModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
