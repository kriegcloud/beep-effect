/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: merge
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.942Z
 *
 * Overview:
 * Unwraps a `Result` into `A | E` by returning the inner value regardless of whether it is a success or failure.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 *
 * console.log(Result.merge(Result.succeed(42)))
 * // Output: 42
 *
 * console.log(Result.merge(Result.fail("error")))
 * // Output: "error"
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, formatUnknown, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "merge";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary =
  "Unwraps a `Result` into `A | E` by returning the inner value regardless of whether it is a success or failure.";
const sourceExample =
  'import { Result } from "effect"\n\nconsole.log(Result.merge(Result.succeed(42)))\n// Output: 42\n\nconsole.log(Result.merge(Result.fail("error")))\n// Output: "error"';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Result.merge as a runtime function export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  yield* Console.log("Unwrap success and failure values using merge(result).");
  const fromSuccess = ResultModule.merge(ResultModule.succeed(42));
  const fromFailure = ResultModule.merge(ResultModule.fail("error"));

  yield* Console.log(`merge(succeed(42)) -> ${formatUnknown(fromSuccess)}`);
  yield* Console.log(`merge(fail("error")) -> ${formatUnknown(fromFailure)}`);
});

const exampleChannelInfoDiscarded = Effect.gen(function* () {
  yield* Console.log("After merge, payload equality no longer reveals success vs failure origin.");
  const fromSuccess = ResultModule.merge(ResultModule.succeed("cached"));
  const fromFailure = ResultModule.merge(ResultModule.fail("cached"));

  yield* Console.log(`from succeed("cached") -> ${formatUnknown(fromSuccess)}`);
  yield* Console.log(`from fail("cached") -> ${formatUnknown(fromFailure)}`);
  yield* Console.log(`merged values equal: ${fromSuccess === fromFailure}`);
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
      title: "Source-Aligned Merge Invocation",
      description: "Reproduce the documented behavior for success and failure payloads.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Channel Info Is Discarded",
      description: "Show that merge returns only payloads, not the original Result channel.",
      run: exampleChannelInfoDiscarded,
    },
  ],
});

BunRuntime.runMain(program);
