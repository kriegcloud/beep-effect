/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Response
 * Export: ReasoningPart
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Response.ts
 * Generated: 2026-02-19T04:14:24.101Z
 *
 * Overview:
 * Response part representing reasoning or chain-of-thought content.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Response } from "effect/unstable/ai"
 *
 * const reasoningPart: Response.ReasoningPart = Response.makePart("reasoning", {
 *   text:
 *     "Let me think step by step: First I need to analyze the user's question..."
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ResponseModule from "effect/unstable/ai/Response";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ReasoningPart";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/ai/Response";
const sourceSummary = "Response part representing reasoning or chain-of-thought content.";
const sourceExample =
  'import { Response } from "effect/unstable/ai"\n\nconst reasoningPart: Response.ReasoningPart = Response.makePart("reasoning", {\n  text:\n    "Let me think step by step: First I need to analyze the user\'s question..."\n})';
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
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
