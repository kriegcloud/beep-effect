/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: scan
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.641Z
 *
 * Overview:
 * Statefully transforms a channel by scanning over its output with an accumulator function. Emits the intermediate results of the scan operation.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel } from "effect"
 * 
 * // Create a channel with numbers
 * const numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5])
 * 
 * // Scan to create running sum
 * const runningSumChannel = Channel.scan(numbersChannel, 0, (sum, n) => sum + n)
 * // Outputs: 0, 1, 3, 6, 10, 15
 * // Note: emits the initial value and each intermediate result
 * 
 * // Scan with string concatenation
 * const wordsChannel = Channel.fromIterable(["hello", "world", "from", "effect"])
 * const sentenceChannel = Channel.scan(
 *   wordsChannel,
 *   "",
 *   (sentence, word) => sentence === "" ? word : `${sentence} ${word}`
 * )
 * // Outputs: "", "hello", "hello world", "hello world from", "hello world from effect"
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
import * as ChannelModule from "effect/Channel";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "scan";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Statefully transforms a channel by scanning over its output with an accumulator function. Emits the intermediate results of the scan operation.";
const sourceExample = "import { Channel } from \"effect\"\n\n// Create a channel with numbers\nconst numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5])\n\n// Scan to create running sum\nconst runningSumChannel = Channel.scan(numbersChannel, 0, (sum, n) => sum + n)\n// Outputs: 0, 1, 3, 6, 10, 15\n// Note: emits the initial value and each intermediate result\n\n// Scan with string concatenation\nconst wordsChannel = Channel.fromIterable([\"hello\", \"world\", \"from\", \"effect\"])\nconst sentenceChannel = Channel.scan(\n  wordsChannel,\n  \"\",\n  (sentence, word) => sentence === \"\" ? word : `${sentence} ${word}`\n)\n// Outputs: \"\", \"hello\", \"hello world\", \"hello world from\", \"hello world from effect\"";
const moduleRecord = ChannelModule as Record<string, unknown>;

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
