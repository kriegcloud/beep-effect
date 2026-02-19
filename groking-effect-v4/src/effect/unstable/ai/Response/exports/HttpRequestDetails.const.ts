/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Response
 * Export: HttpRequestDetails
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Response.ts
 * Generated: 2026-02-19T04:14:24.101Z
 *
 * Overview:
 * Schema for HTTP request details associated with an AI response.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Response } from "effect/unstable/ai"
 *
 * const requestDetails: typeof Response.HttpRequestDetails.Type = {
 *   method: "POST",
 *   url: "https://api.openai.com/v1/responses",
 *   urlParams: [],
 *   hash: undefined,
 *   headers: { "Content-Type": "application/json" }
 * }
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
import * as ResponseModule from "effect/unstable/ai/Response";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "HttpRequestDetails";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/Response";
const sourceSummary = "Schema for HTTP request details associated with an AI response.";
const sourceExample =
  'import type { Response } from "effect/unstable/ai"\n\nconst requestDetails: typeof Response.HttpRequestDetails.Type = {\n  method: "POST",\n  url: "https://api.openai.com/v1/responses",\n  urlParams: [],\n  hash: undefined,\n  headers: { "Content-Type": "application/json" }\n}';
const moduleRecord = ResponseModule as Record<string, unknown>;

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
