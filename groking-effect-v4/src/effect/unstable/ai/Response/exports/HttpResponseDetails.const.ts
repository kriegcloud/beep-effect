/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Response
 * Export: HttpResponseDetails
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Response.ts
 * Generated: 2026-02-19T04:14:24.101Z
 *
 * Overview:
 * Schema for HTTP response details associated with an AI response.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Response } from "effect/unstable/ai"
 * 
 * const responseDetails: typeof Response.HttpResponseDetails.Type = {
 *   status: 200,
 *   headers: {
 *     "Content-Type": "application/json",
 *     "X-Request-Id": "req_abc123"
 *   }
 * }
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
import * as ResponseModule from "effect/unstable/ai/Response";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "HttpResponseDetails";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/Response";
const sourceSummary = "Schema for HTTP response details associated with an AI response.";
const sourceExample = "import type { Response } from \"effect/unstable/ai\"\n\nconst responseDetails: typeof Response.HttpResponseDetails.Type = {\n  status: 200,\n  headers: {\n    \"Content-Type\": \"application/json\",\n    \"X-Request-Id\": \"req_abc123\"\n  }\n}";
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
