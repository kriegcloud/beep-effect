/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Chat
 * Export: Chat
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Chat.ts
 * Generated: 2026-02-19T04:14:23.876Z
 *
 * Overview:
 * The `Chat` service tag for dependency injection.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { Chat } from "effect/unstable/ai"
 *
 * const program = Effect.gen(function*() {
 *   const chat = yield* Chat.empty
 *   const response = yield* chat.generateText({
 *     prompt: "Explain quantum computing in simple terms"
 *   })
 *   return response.content
 * })
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ChatModule from "effect/unstable/ai/Chat";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Chat";
const exportKind = "class";
const moduleImportPath = "effect/unstable/ai/Chat";
const sourceSummary = "The `Chat` service tag for dependency injection.";
const sourceExample =
  'import { Effect } from "effect"\nimport { Chat } from "effect/unstable/ai"\n\nconst program = Effect.gen(function*() {\n  const chat = yield* Chat.empty\n  const response = yield* chat.generateText({\n    prompt: "Explain quantum computing in simple terms"\n  })\n  return response.content\n})';
const moduleRecord = ChatModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleClassDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata and class-like surface information.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleConstructionProbe = Effect.gen(function* () {
  yield* Console.log("Attempt a zero-arg construction probe.");
  yield* probeNamedExportConstructor({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧱",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Class Discovery",
      description: "Inspect runtime shape and discover class metadata.",
      run: exampleClassDiscovery,
    },
    {
      title: "Zero-Arg Construction Probe",
      description: "Attempt construction and report constructor behavior.",
      run: exampleConstructionProbe,
    },
  ],
});

BunRuntime.runMain(program);
