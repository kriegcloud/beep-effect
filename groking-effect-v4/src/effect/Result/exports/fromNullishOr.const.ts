/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: fromNullishOr
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Converts a possibly `null` or `undefined` value into a `Result`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 *
 * console.log(Result.fromNullishOr(1, () => "fallback"))
 * // Output: { _tag: "Success", success: 1, ... }
 *
 * console.log(Result.fromNullishOr(null, () => "fallback"))
 * // Output: { _tag: "Failure", failure: "fallback", ... }
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
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromNullishOr";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Converts a possibly `null` or `undefined` value into a `Result`.";
const sourceExample =
  'import { Result } from "effect"\n\nconsole.log(Result.fromNullishOr(1, () => "fallback"))\n// Output: { _tag: "Success", success: 1, ... }\n\nconsole.log(Result.fromNullishOr(null, () => "fallback"))\n// Output: { _tag: "Failure", failure: "fallback", ... }';
const moduleRecord = ResultModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export shape before running behavior examples.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleNonNullishInput = Effect.gen(function* () {
  const result = ResultModule.fromNullishOr(1, () => "fallback");
  const summary = ResultModule.match(result, {
    onSuccess: (value) => `Success(${value})`,
    onFailure: (error) => `Failure(${String(error)})`,
  });

  yield* Console.log(`Non-nullish input keeps the value -> ${summary}`);
});

const exampleNullishInput = Effect.gen(function* () {
  const input: string | undefined = undefined;
  const result = ResultModule.fromNullishOr(input, (original) => `fallback from ${String(original)}`);
  const summary = ResultModule.match(result, {
    onSuccess: (value) => `Success(${value})`,
    onFailure: (error) => `Failure(${error})`,
  });

  yield* Console.log(`Nullish input uses onNullish callback -> ${summary}`);
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
      title: "Data-First Success Case",
      description: "A non-nullish input yields Success and ignores the fallback callback.",
      run: exampleNonNullishInput,
    },
    {
      title: "Nullish Failure Case",
      description: "A nullish input yields Failure and uses the callback return as the error.",
      run: exampleNullishInput,
    },
  ],
});

BunRuntime.runMain(program);
