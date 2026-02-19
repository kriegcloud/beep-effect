/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Prompt
 * Export: fromResponseParts
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Prompt.ts
 * Generated: 2026-02-19T04:14:24.059Z
 *
 * Overview:
 * Creates a Prompt from the response parts of a previous interaction with a large language model.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Prompt, Response } from "effect/unstable/ai"
 *
 * const responseParts: ReadonlyArray<Response.AnyPart> = [
 *   Response.makePart("text", {
 *     text: "Hello there!"
 *   }),
 *   Response.makePart("tool-call", {
 *     id: "call_1",
 *     name: "get_time",
 *     params: {},
 *     providerExecuted: false
 *   }),
 *   Response.makePart("tool-result", {
 *     id: "call_1",
 *     name: "get_time",
 *     isFailure: false,
 *     result: "10:30 AM",
 *     encodedResult: "10:30 AM",
 *     providerExecuted: false,
 *     preliminary: false
 *   })
 * ]
 *
 * const prompt = Prompt.fromResponseParts(responseParts)
 * // Creates an assistant message with the response content
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
const exportName = "fromResponseParts";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/Prompt";
const sourceSummary = "Creates a Prompt from the response parts of a previous interaction with a large language model.";
const sourceExample =
  'import { Prompt, Response } from "effect/unstable/ai"\n\nconst responseParts: ReadonlyArray<Response.AnyPart> = [\n  Response.makePart("text", {\n    text: "Hello there!"\n  }),\n  Response.makePart("tool-call", {\n    id: "call_1",\n    name: "get_time",\n    params: {},\n    providerExecuted: false\n  }),\n  Response.makePart("tool-result", {\n    id: "call_1",\n    name: "get_time",\n    isFailure: false,\n    result: "10:30 AM",\n    encodedResult: "10:30 AM",\n    providerExecuted: false,\n    preliminary: false\n  })\n]\n\nconst prompt = Prompt.fromResponseParts(responseParts)\n// Creates an assistant message with the response content';
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
