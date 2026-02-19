/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Prompt
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Prompt.ts
 * Generated: 2026-02-19T04:14:24.059Z
 *
 * Overview:
 * Creates a Prompt from an input.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 * 
 * // From string - creates a user message
 * const textPrompt = Prompt.make("Hello, how are you?")
 * 
 * // From messages array
 * const structuredPrompt = Prompt.make([
 *   { role: "system", content: "You are a helpful assistant." },
 *   { role: "user", content: [{ type: "text", text: "Hi!" }] }
 * ])
 * 
 * // From existing prompt
 * declare const existingPrompt: Prompt.Prompt
 * const copiedPrompt = Prompt.make(existingPrompt)
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as PromptModule from "effect/unstable/ai/Prompt";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/Prompt";
const sourceSummary = "Creates a Prompt from an input.";
const sourceExample = "import { Prompt } from \"effect/unstable/ai\"\n\n// From string - creates a user message\nconst textPrompt = Prompt.make(\"Hello, how are you?\")\n\n// From messages array\nconst structuredPrompt = Prompt.make([\n  { role: \"system\", content: \"You are a helpful assistant.\" },\n  { role: \"user\", content: [{ type: \"text\", text: \"Hi!\" }] }\n])\n\n// From existing prompt\ndeclare const existingPrompt: Prompt.Prompt\nconst copiedPrompt = Prompt.make(existingPrompt)";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
