/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/LanguageModel
 * Export: generateObject
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/LanguageModel.ts
 * Generated: 2026-02-19T04:14:23.924Z
 *
 * Overview:
 * Generate a structured object from a schema using a language model.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Schema } from "effect"
 * import { LanguageModel } from "effect/unstable/ai"
 *
 * const EventSchema = Schema.Struct({
 *   title: Schema.String,
 *   date: Schema.String,
 *   location: Schema.String
 * })
 *
 * const program = Effect.gen(function*() {
 *   const response = yield* LanguageModel.generateObject({
 *     prompt:
 *       "Extract event info: Tech Conference on March 15th in San Francisco",
 *     schema: EventSchema,
 *     objectName: "event"
 *   })
 *
 *   console.log(response.value)
 *   // { title: "Tech Conference", date: "March 15th", location: "San Francisco" }
 *
 *   return response.value
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
import * as LanguageModelModule from "effect/unstable/ai/LanguageModel";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "generateObject";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/LanguageModel";
const sourceSummary = "Generate a structured object from a schema using a language model.";
const sourceExample =
  'import { Effect, Schema } from "effect"\nimport { LanguageModel } from "effect/unstable/ai"\n\nconst EventSchema = Schema.Struct({\n  title: Schema.String,\n  date: Schema.String,\n  location: Schema.String\n})\n\nconst program = Effect.gen(function*() {\n  const response = yield* LanguageModel.generateObject({\n    prompt:\n      "Extract event info: Tech Conference on March 15th in San Francisco",\n    schema: EventSchema,\n    objectName: "event"\n  })\n\n  console.log(response.value)\n  // { title: "Tech Conference", date: "March 15th", location: "San Francisco" }\n\n  return response.value\n})';
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
