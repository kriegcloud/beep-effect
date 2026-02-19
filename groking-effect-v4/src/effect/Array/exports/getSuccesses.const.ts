/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: getSuccesses
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.359Z
 *
 * Overview:
 * Extracts all success values from an iterable of `Result`s, discarding failures.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Result } from "effect"
 *
 * console.log(Array.getSuccesses([Result.succeed(1), Result.fail("err"), Result.succeed(2)]))
 * // [1, 2]
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
const exportName = "getSuccesses";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Extracts all success values from an iterable of `Result`s, discarding failures.";
const sourceExample =
  'import { Array, Result } from "effect"\n\nconsole.log(Array.getSuccesses([Result.succeed(1), Result.fail("err"), Result.succeed(2)]))\n// [1, 2]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [Result.succeed(1), Result.fail("err"), Result.succeed(2)];
  const successes = A.getSuccesses(input);

  yield* Console.log(`A.getSuccesses([succeed(1), fail("err"), succeed(2)]) => ${JSON.stringify(successes)}`);
});

const exampleIterableAndEdgeCases = Effect.gen(function* () {
  const fromSet = A.getSuccesses(new Set([Result.succeed("first"), Result.fail("err"), Result.succeed("second")]));
  const noSuccesses = A.getSuccesses([Result.fail("bad"), Result.fail("worse")]);

  yield* Console.log(`A.getSuccesses(Set([...])) preserves success order => ${JSON.stringify(fromSet)}`);
  yield* Console.log(`A.getSuccesses(all failures) => ${JSON.stringify(noSuccesses)}`);
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
      description: "Extract only success values from the documented mixed Result input.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Iterable Input And Empty Case",
      description: "Show iterable support and the empty output when no successes are present.",
      run: exampleIterableAndEdgeCases,
    },
  ],
});

BunRuntime.runMain(program);
