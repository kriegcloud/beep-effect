/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Chat
 * Export: empty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Chat.ts
 * Generated: 2026-02-19T04:14:23.876Z
 *
 * Overview:
 * Creates a new Chat service with empty conversation history.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { Chat } from "effect/unstable/ai"
 *
 * const freshChat = Effect.gen(function*() {
 *   const chat = yield* Chat.empty
 *
 *   const response = yield* chat.generateText({
 *     prompt: "Hello! Can you introduce yourself?"
 *   })
 *
 *   console.log(response.content)
 *
 *   return chat
 * })
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
const exportName = "empty";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/Chat";
const sourceSummary = "Creates a new Chat service with empty conversation history.";
const sourceExample =
  'import { Effect } from "effect"\nimport { Chat } from "effect/unstable/ai"\n\nconst freshChat = Effect.gen(function*() {\n  const chat = yield* Chat.empty\n\n  const response = yield* chat.generateText({\n    prompt: "Hello! Can you introduce yourself?"\n  })\n\n  console.log(response.content)\n\n  return chat\n})';
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
