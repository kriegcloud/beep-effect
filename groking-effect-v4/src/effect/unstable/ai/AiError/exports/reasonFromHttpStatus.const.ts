/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/AiError
 * Export: reasonFromHttpStatus
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/AiError.ts
 * Generated: 2026-02-19T04:50:45.138Z
 *
 * Overview:
 * Maps HTTP status codes to semantic error reasons.
 *
 * Source JSDoc Example:
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const reason = AiError.reasonFromHttpStatus({
 *   status: 429,
 *   body: { error: "Rate limit exceeded" }
 * })
 *
 * console.log(reason._tag) // "RateLimitError"
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
import * as AiErrorModule from "effect/unstable/ai/AiError";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "reasonFromHttpStatus";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/AiError";
const sourceSummary = "Maps HTTP status codes to semantic error reasons.";
const sourceExample =
  'import { AiError } from "effect/unstable/ai"\n\nconst reason = AiError.reasonFromHttpStatus({\n  status: 429,\n  body: { error: "Rate limit exceeded" }\n})\n\nconsole.log(reason._tag) // "RateLimitError"';
const moduleRecord = AiErrorModule as Record<string, unknown>;

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
