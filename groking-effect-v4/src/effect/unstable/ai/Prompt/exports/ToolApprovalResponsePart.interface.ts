/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Prompt
 * Export: ToolApprovalResponsePart
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Prompt.ts
 * Generated: 2026-02-19T04:14:24.061Z
 *
 * Overview:
 * Content part representing a user's response to a tool approval request.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 * 
 * const approvalResponse: Prompt.ToolApprovalResponsePart = Prompt.makePart(
 *   "tool-approval-response",
 *   {
 *     approvalId: "approval_123",
 *     approved: true
 *   }
 * )
 * 
 * const denialResponse: Prompt.ToolApprovalResponsePart = Prompt.makePart(
 *   "tool-approval-response",
 *   {
 *     approvalId: "approval_456",
 *     approved: false,
 *     reason: "Operation not allowed"
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
import * as PromptModule from "effect/unstable/ai/Prompt";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ToolApprovalResponsePart";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/ai/Prompt";
const sourceSummary = "Content part representing a user's response to a tool approval request.";
const sourceExample = "import { Prompt } from \"effect/unstable/ai\"\n\nconst approvalResponse: Prompt.ToolApprovalResponsePart = Prompt.makePart(\n  \"tool-approval-response\",\n  {\n    approvalId: \"approval_123\",\n    approved: true\n  }\n)\n\nconst denialResponse: Prompt.ToolApprovalResponsePart = Prompt.makePart(\n  \"tool-approval-response\",\n  {\n    approvalId: \"approval_456\",\n    approved: false,\n    reason: \"Operation not allowed\"\n  }\n)";
const moduleRecord = PromptModule as Record<string, unknown>;

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
