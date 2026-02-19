/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Response
 * Export: ResponseMetadataPart
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Response.ts
 * Generated: 2026-02-19T04:14:24.102Z
 *
 * Overview:
 * Response part containing metadata about the large language model response.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 * import { Response } from "effect/unstable/ai"
 * 
 * const metadataPart: Response.ResponseMetadataPart = Response.makePart(
 *   "response-metadata",
 *   {
 *     id: "resp_123",
 *     modelId: "gpt-4",
 *     timestamp: DateTime.nowUnsafe(),
 *     request: undefined
 *   }
 * )
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ResponseModule from "effect/unstable/ai/Response";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ResponseMetadataPart";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/ai/Response";
const sourceSummary = "Response part containing metadata about the large language model response.";
const sourceExample = "import { DateTime } from \"effect\"\nimport { Response } from \"effect/unstable/ai\"\n\nconst metadataPart: Response.ResponseMetadataPart = Response.makePart(\n  \"response-metadata\",\n  {\n    id: \"resp_123\",\n    modelId: \"gpt-4\",\n    timestamp: DateTime.nowUnsafe(),\n    request: undefined\n  }\n)";
const moduleRecord = ResponseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
