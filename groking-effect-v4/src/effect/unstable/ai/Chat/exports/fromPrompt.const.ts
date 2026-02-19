/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Chat
 * Export: fromPrompt
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Chat.ts
 * Generated: 2026-02-19T04:14:23.877Z
 *
 * Overview:
 * Creates a new Chat service from an initial prompt.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { Chat } from "effect/unstable/ai"
 * 
 * const chatWithSystemPrompt = Effect.gen(function*() {
 *   const chat = yield* Chat.fromPrompt([{
 *     role: "system",
 *     content: "You are a helpful assistant specialized in mathematics."
 *   }])
 * 
 *   const response = yield* chat.generateText({
 *     prompt: "What is 2+2?"
 *   })
 * 
 *   return response.content
 * })
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
import * as ChatModule from "effect/unstable/ai/Chat";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromPrompt";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/Chat";
const sourceSummary = "Creates a new Chat service from an initial prompt.";
const sourceExample = "import { Effect } from \"effect\"\nimport { Chat } from \"effect/unstable/ai\"\n\nconst chatWithSystemPrompt = Effect.gen(function*() {\n  const chat = yield* Chat.fromPrompt([{\n    role: \"system\",\n    content: \"You are a helpful assistant specialized in mathematics.\"\n  }])\n\n  const response = yield* chat.generateText({\n    prompt: \"What is 2+2?\"\n  })\n\n  return response.content\n})";
const moduleRecord = ChatModule as Record<string, unknown>;

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
