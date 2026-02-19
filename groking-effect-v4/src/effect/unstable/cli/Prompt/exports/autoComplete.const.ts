/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Prompt
 * Export: autoComplete
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Prompt.ts
 * Generated: 2026-02-19T04:50:46.788Z
 *
 * Overview:
 * Creates a prompt that lets users filter select choices by typing.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Prompt } from "effect/unstable/cli"
 *
 * const language = Prompt.autoComplete({
 *   message: "Choose a language",
 *   choices: [
 *     { title: "TypeScript", value: "ts" },
 *     { title: "Rust", value: "rs" },
 *     { title: "Kotlin", value: "kt" }
 *   ]
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as PromptModule from "effect/unstable/cli/Prompt";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "autoComplete";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Prompt";
const sourceSummary = "Creates a prompt that lets users filter select choices by typing.";
const sourceExample =
  'import { Prompt } from "effect/unstable/cli"\n\nconst language = Prompt.autoComplete({\n  message: "Choose a language",\n  choices: [\n    { title: "TypeScript", value: "ts" },\n    { title: "Rust", value: "rs" },\n    { title: "Kotlin", value: "kt" }\n  ]\n})';
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
