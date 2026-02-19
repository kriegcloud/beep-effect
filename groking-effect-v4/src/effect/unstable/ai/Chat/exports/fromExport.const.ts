/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Chat
 * Export: fromExport
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Chat.ts
 * Generated: 2026-02-19T04:14:23.876Z
 *
 * Overview:
 * Creates a Chat service from previously exported chat data.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { Chat } from "effect/unstable/ai"
 *
 * declare const loadFromDatabase: (sessionId: string) => Effect.Effect<unknown>
 *
 * const restoreChat = Effect.gen(function*() {
 *   // Assume we have previously exported data
 *   const savedData = yield* loadFromDatabase("chat-session-123")
 *
 *   const restoredChat = yield* Chat.fromExport(savedData)
 *
 *   // Continue the conversation from where it left off
 *   const response = yield* restoredChat.generateText({
 *     prompt: "Let's continue our discussion"
 *   })
 * }).pipe(
 *   Effect.catchTag("SchemaError", (error) => {
 *     console.log("Failed to restore chat:", error.message)
 *     return Effect.void
 *   })
 * )
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
import * as ChatModule from "effect/unstable/ai/Chat";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromExport";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/Chat";
const sourceSummary = "Creates a Chat service from previously exported chat data.";
const sourceExample =
  'import { Effect } from "effect"\nimport { Chat } from "effect/unstable/ai"\n\ndeclare const loadFromDatabase: (sessionId: string) => Effect.Effect<unknown>\n\nconst restoreChat = Effect.gen(function*() {\n  // Assume we have previously exported data\n  const savedData = yield* loadFromDatabase("chat-session-123")\n\n  const restoredChat = yield* Chat.fromExport(savedData)\n\n  // Continue the conversation from where it left off\n  const response = yield* restoredChat.generateText({\n    prompt: "Let\'s continue our discussion"\n  })\n}).pipe(\n  Effect.catchTag("SchemaError", (error) => {\n    console.log("Failed to restore chat:", error.message)\n    return Effect.void\n  })\n)';
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
