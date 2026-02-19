/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Tokenizer
 * Export: Tokenizer
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Tokenizer.ts
 * Generated: 2026-02-19T04:14:24.117Z
 *
 * Overview:
 * The `Tokenizer` service tag for dependency injection.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { Tokenizer } from "effect/unstable/ai"
 * 
 * const useTokenizer = Effect.gen(function*() {
 *   const tokenizer = yield* Tokenizer.Tokenizer
 *   const tokens = yield* tokenizer.tokenize("Hello, world!")
 *   return tokens.length
 * })
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as TokenizerModule from "effect/unstable/ai/Tokenizer";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Tokenizer";
const exportKind = "class";
const moduleImportPath = "effect/unstable/ai/Tokenizer";
const sourceSummary = "The `Tokenizer` service tag for dependency injection.";
const sourceExample = "import { Effect } from \"effect\"\nimport { Tokenizer } from \"effect/unstable/ai\"\n\nconst useTokenizer = Effect.gen(function*() {\n  const tokenizer = yield* Tokenizer.Tokenizer\n  const tokens = yield* tokenizer.tokenize(\"Hello, world!\")\n  return tokens.length\n})";
const moduleRecord = TokenizerModule as Record<string, unknown>;

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
      run: exampleClassDiscovery
    },
    {
      title: "Zero-Arg Construction Probe",
      description: "Attempt construction and report constructor behavior.",
      run: exampleConstructionProbe
    }
  ]
});

BunRuntime.runMain(program);
