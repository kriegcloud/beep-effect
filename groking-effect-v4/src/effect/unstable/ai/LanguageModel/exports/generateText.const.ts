/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/LanguageModel
 * Export: generateText
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/LanguageModel.ts
 * Generated: 2026-02-19T04:14:23.924Z
 *
 * Overview:
 * Generate text using a language model.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { LanguageModel } from "effect/unstable/ai"
 * 
 * const program = Effect.gen(function*() {
 *   const response = yield* LanguageModel.generateText({
 *     prompt: "Write a haiku about programming",
 *     toolChoice: "none"
 *   })
 * 
 *   console.log(response.text)
 *   console.log(response.usage.inputTokens.total)
 * 
 *   return response
 * })
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
import * as LanguageModelModule from "effect/unstable/ai/LanguageModel";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "generateText";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/LanguageModel";
const sourceSummary = "Generate text using a language model.";
const sourceExample = "import { Effect } from \"effect\"\nimport { LanguageModel } from \"effect/unstable/ai\"\n\nconst program = Effect.gen(function*() {\n  const response = yield* LanguageModel.generateText({\n    prompt: \"Write a haiku about programming\",\n    toolChoice: \"none\"\n  })\n\n  console.log(response.text)\n  console.log(response.usage.inputTokens.total)\n\n  return response\n})";
const moduleRecord = LanguageModelModule as Record<string, unknown>;

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
