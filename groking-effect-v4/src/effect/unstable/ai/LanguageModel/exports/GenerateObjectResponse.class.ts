/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/LanguageModel
 * Export: GenerateObjectResponse
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/LanguageModel.ts
 * Generated: 2026-02-19T04:14:23.924Z
 *
 * Overview:
 * Response class for structured object generation operations.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Schema } from "effect"
 * import { LanguageModel } from "effect/unstable/ai"
 * 
 * const UserSchema = Schema.Struct({
 *   name: Schema.String,
 *   email: Schema.String
 * })
 * 
 * const program = Effect.gen(function*() {
 *   const response = yield* LanguageModel.generateObject({
 *     prompt: "Create user: John Doe, john@example.com",
 *     schema: UserSchema
 *   })
 * 
 *   console.log(response.value) // { name: "John Doe", email: "john@example.com" }
 *   console.log(response.text) // Raw generated text
 * 
 *   return response.value
 * })
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as LanguageModelModule from "effect/unstable/ai/LanguageModel";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "GenerateObjectResponse";
const exportKind = "class";
const moduleImportPath = "effect/unstable/ai/LanguageModel";
const sourceSummary = "Response class for structured object generation operations.";
const sourceExample = "import { Effect, Schema } from \"effect\"\nimport { LanguageModel } from \"effect/unstable/ai\"\n\nconst UserSchema = Schema.Struct({\n  name: Schema.String,\n  email: Schema.String\n})\n\nconst program = Effect.gen(function*() {\n  const response = yield* LanguageModel.generateObject({\n    prompt: \"Create user: John Doe, john@example.com\",\n    schema: UserSchema\n  })\n\n  console.log(response.value) // { name: \"John Doe\", email: \"john@example.com\" }\n  console.log(response.text) // Raw generated text\n\n  return response.value\n})";
const moduleRecord = LanguageModelModule as Record<string, unknown>;

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
