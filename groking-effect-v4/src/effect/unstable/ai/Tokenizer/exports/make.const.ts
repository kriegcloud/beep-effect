/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Tokenizer
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Tokenizer.ts
 * Generated: 2026-02-19T04:14:24.117Z
 *
 * Overview:
 * Creates a Tokenizer service implementation from tokenization options.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { Tokenizer } from "effect/unstable/ai"
 *
 * // Simple word-based tokenizer
 * const wordTokenizer = Tokenizer.make({
 *   tokenize: (prompt) =>
 *     Effect.succeed(
 *       prompt.content
 *         .flatMap((msg) =>
 *           typeof msg.content === "string"
 *             ? msg.content.split(" ")
 *             : msg.content.flatMap((part) =>
 *               part.type === "text" ? part.text.split(" ") : []
 *             )
 *         )
 *         .map((_, index) => index)
 *     )
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
import * as TokenizerModule from "effect/unstable/ai/Tokenizer";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/Tokenizer";
const sourceSummary = "Creates a Tokenizer service implementation from tokenization options.";
const sourceExample =
  'import { Effect } from "effect"\nimport { Tokenizer } from "effect/unstable/ai"\n\n// Simple word-based tokenizer\nconst wordTokenizer = Tokenizer.make({\n  tokenize: (prompt) =>\n    Effect.succeed(\n      prompt.content\n        .flatMap((msg) =>\n          typeof msg.content === "string"\n            ? msg.content.split(" ")\n            : msg.content.flatMap((part) =>\n              part.type === "text" ? part.text.split(" ") : []\n            )\n        )\n        .map((_, index) => index)\n    )\n})';
const moduleRecord = TokenizerModule as Record<string, unknown>;

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
