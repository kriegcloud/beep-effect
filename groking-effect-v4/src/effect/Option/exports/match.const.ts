/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: match
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * Pattern-matches on an `Option`, handling both `None` and `Some` cases.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * const message = Option.match(Option.some(1), {
 *   onNone: () => "Option is empty",
 *   onSome: (value) => `Option has a value: ${value}`
 * })
 *
 * console.log(message)
 * // Output: "Option has a value: 1"
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "match";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Pattern-matches on an `Option`, handling both `None` and `Some` cases.";
const sourceExample =
  'import { Option } from "effect"\n\nconst message = Option.match(Option.some(1), {\n  onNone: () => "Option is empty",\n  onSome: (value) => `Option has a value: ${value}`\n})\n\nconsole.log(message)\n// Output: "Option has a value: 1"';
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.match as a runtime function export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedMatch = Effect.gen(function* () {
  yield* Console.log("Run the source JSDoc pattern for Some and None.");
  const handlers = {
    onNone: () => "Option is empty",
    onSome: (value: number) => `Option has a value: ${value}`,
  };

  const someMessage = O.match(O.some(1), handlers);
  const noneMessage = O.match(O.none<number>(), handlers);

  yield* Console.log(`match(some(1), handlers) -> ${someMessage}`);
  yield* Console.log(`match(none(), handlers) -> ${noneMessage}`);
});

const exampleReusableDataLastMatcher = Effect.gen(function* () {
  yield* Console.log("Build a reusable matcher with data-last Option.match(handlers).");
  const describeScore = O.match({
    onNone: () => "score:missing",
    onSome: (score: number) => (score >= 10 ? `score:${score}:double-digits` : `score:${score}:single-digit`),
  });

  yield* Console.log(`describeScore(some(12)) -> ${describeScore(O.some(12))}`);
  yield* Console.log(`describeScore(some(7)) -> ${describeScore(O.some(7))}`);
  yield* Console.log(`describeScore(none()) -> ${describeScore(O.none<number>())}`);
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
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source JSDoc Behavior",
      description: "Match Some and None using the documented Option.match(option, handlers) form.",
      run: exampleSourceAlignedMatch,
    },
    {
      title: "Reusable Data-Last Matcher",
      description: "Prebuild handlers with Option.match(handlers) and reuse them across Option inputs.",
      run: exampleReusableDataLastMatcher,
    },
  ],
});

BunRuntime.runMain(program);
