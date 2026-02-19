/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Model
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Model.ts
 * Generated: 2026-02-19T04:14:24.006Z
 *
 * Overview:
 * Creates a Model from a provider name and a Layer that constructs AI services.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Layer } from "effect"
 * import { Effect } from "effect"
 * import { LanguageModel, Model } from "effect/unstable/ai"
 * 
 * declare const bedrockLayer: Layer.Layer<LanguageModel.LanguageModel>
 * 
 * // Model automatically provides ProviderName service
 * const checkProviderAndGenerate = Effect.gen(function*() {
 *   const provider = yield* Model.ProviderName
 * 
 *   console.log(`Generating with: ${provider}`)
 * 
 *   return yield* LanguageModel.generateText({
 *     prompt: `Hello from ${provider}!`
 *   })
 * })
 * 
 * const program = checkProviderAndGenerate.pipe(
 *   Effect.provide(Model.make("amazon-bedrock", bedrockLayer))
 * )
 * // Will log: "Generating with: amazon-bedrock"
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
import * as ModelModule from "effect/unstable/ai/Model";
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
const moduleImportPath = "effect/unstable/ai/Model";
const sourceSummary = "Creates a Model from a provider name and a Layer that constructs AI services.";
const sourceExample = "import type { Layer } from \"effect\"\nimport { Effect } from \"effect\"\nimport { LanguageModel, Model } from \"effect/unstable/ai\"\n\ndeclare const bedrockLayer: Layer.Layer<LanguageModel.LanguageModel>\n\n// Model automatically provides ProviderName service\nconst checkProviderAndGenerate = Effect.gen(function*() {\n  const provider = yield* Model.ProviderName\n\n  console.log(`Generating with: ${provider}`)\n\n  return yield* LanguageModel.generateText({\n    prompt: `Hello from ${provider}!`\n  })\n})\n\nconst program = checkProviderAndGenerate.pipe(\n  Effect.provide(Model.make(\"amazon-bedrock\", bedrockLayer))\n)\n// Will log: \"Generating with: amazon-bedrock\"";
const moduleRecord = ModelModule as Record<string, unknown>;

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
