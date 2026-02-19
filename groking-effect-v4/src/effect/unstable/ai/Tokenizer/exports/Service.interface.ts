/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Tokenizer
 * Export: Service
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Tokenizer.ts
 * Generated: 2026-02-19T04:14:24.117Z
 *
 * Overview:
 * Tokenizer service interface providing text tokenization and truncation operations.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import type { Tokenizer } from "effect/unstable/ai"
 * import { Prompt } from "effect/unstable/ai"
 * 
 * const customTokenizer: Tokenizer.Service = {
 *   tokenize: (input) =>
 *     Effect.succeed(input.toString().split(" ").map((_, i) => i)),
 *   truncate: (input, maxTokens) =>
 *     Effect.succeed(Prompt.make(input.toString().slice(0, maxTokens * 5)))
 * }
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
import * as TokenizerModule from "effect/unstable/ai/Tokenizer";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Service";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/ai/Tokenizer";
const sourceSummary = "Tokenizer service interface providing text tokenization and truncation operations.";
const sourceExample = "import { Effect } from \"effect\"\nimport type { Tokenizer } from \"effect/unstable/ai\"\nimport { Prompt } from \"effect/unstable/ai\"\n\nconst customTokenizer: Tokenizer.Service = {\n  tokenize: (input) =>\n    Effect.succeed(input.toString().split(\" \").map((_, i) => i)),\n  truncate: (input, maxTokens) =>\n    Effect.succeed(Prompt.make(input.toString().slice(0, maxTokens * 5)))\n}";
const moduleRecord = TokenizerModule as Record<string, unknown>;

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
