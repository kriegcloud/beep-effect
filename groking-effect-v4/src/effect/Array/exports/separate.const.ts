/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: separate
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.368Z
 *
 * Overview:
 * Separates an iterable of `Result`s into two arrays: failures and successes.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Result } from "effect"
 *
 * const [failures, successes] = Array.separate([
 *   Result.succeed(1), Result.fail("error"), Result.succeed(2)
 * ])
 * console.log(failures) // ["error"]
 * console.log(successes) // [1, 2]
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Result from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "separate";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Separates an iterable of `Result`s into two arrays: failures and successes.";
const sourceExample =
  'import { Array, Result } from "effect"\n\nconst [failures, successes] = Array.separate([\n  Result.succeed(1), Result.fail("error"), Result.succeed(2)\n])\nconsole.log(failures) // ["error"]\nconsole.log(successes) // [1, 2]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [Result.succeed(1), Result.fail("error"), Result.succeed(2)];
  const [failures, successes] = A.separate(input);

  yield* Console.log(
    `A.separate([succeed(1), fail("error"), succeed(2)]) => failures=${JSON.stringify(failures)} successes=${JSON.stringify(successes)}`
  );
});

const exampleIterableInputAndEdgeCase = Effect.gen(function* () {
  const [setFailures, setSuccesses] = A.separate(
    new Set([Result.fail("first"), Result.succeed(10), Result.fail("second"), Result.succeed(20)])
  );
  const [allFailures, noSuccesses] = A.separate([Result.fail("bad"), Result.fail("worse")]);

  yield* Console.log(
    `A.separate(Set([...])) => failures=${JSON.stringify(setFailures)} successes=${JSON.stringify(setSuccesses)}`
  );
  yield* Console.log(
    `A.separate(all failures) => failures=${JSON.stringify(allFailures)} successes=${JSON.stringify(noSuccesses)}`
  );
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
      title: "Source-Aligned Invocation",
      description: "Separate mixed Result values into failure and success arrays using the documented call shape.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Iterable Input And Empty Success Case",
      description: "Show iterable support and behavior when the input contains only failures.",
      run: exampleIterableInputAndEdgeCase,
    },
  ],
});

BunRuntime.runMain(program);
