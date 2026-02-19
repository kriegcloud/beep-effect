/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Chat
 * Export: fromJson
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Chat.ts
 * Generated: 2026-02-19T04:14:23.877Z
 *
 * Overview:
 * Creates a Chat service from previously exported JSON chat data.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { Chat } from "effect/unstable/ai"
 * 
 * const restoreFromJson = Effect.gen(function*() {
 *   // Load JSON from localStorage or file system
 *   const jsonData = localStorage.getItem("my-chat-backup")
 *   if (!jsonData) return yield* Chat.empty
 * 
 *   const restoredChat = yield* Chat.fromJson(jsonData)
 * 
 *   // Chat history is now restored
 *   const response = yield* restoredChat.generateText({
 *     prompt: "What were we talking about?"
 *   })
 * 
 *   return response
 * }).pipe(
 *   Effect.catchTag("SchemaError", (error) => {
 *     console.log("Invalid JSON format:", error.message)
 *     return Chat.empty // Fallback to empty chat
 *   })
 * )
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
const exportName = "fromJson";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/Chat";
const sourceSummary = "Creates a Chat service from previously exported JSON chat data.";
const sourceExample = "import { Effect } from \"effect\"\nimport { Chat } from \"effect/unstable/ai\"\n\nconst restoreFromJson = Effect.gen(function*() {\n  // Load JSON from localStorage or file system\n  const jsonData = localStorage.getItem(\"my-chat-backup\")\n  if (!jsonData) return yield* Chat.empty\n\n  const restoredChat = yield* Chat.fromJson(jsonData)\n\n  // Chat history is now restored\n  const response = yield* restoredChat.generateText({\n    prompt: \"What were we talking about?\"\n  })\n\n  return response\n}).pipe(\n  Effect.catchTag(\"SchemaError\", (error) => {\n    console.log(\"Invalid JSON format:\", error.message)\n    return Chat.empty // Fallback to empty chat\n  })\n)";
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
