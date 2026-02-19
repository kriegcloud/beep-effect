/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: partitionMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.367Z
 *
 * Overview:
 * Maps each element to a `Result`, then separates failures and successes into two arrays.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Result } from "effect"
 *
 * const result = Array.partitionMap(
 *   [1, 2, 3, 4, 5],
 *   (x) => x % 2 === 0 ? Result.succeed(x) : Result.fail(x)
 * )
 * console.log(result) // [[1, 3, 5], [2, 4]]
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
const exportName = "partitionMap";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Maps each element to a `Result`, then separates failures and successes into two arrays.";
const sourceExample =
  'import { Array, Result } from "effect"\n\nconst result = Array.partitionMap(\n  [1, 2, 3, 4, 5],\n  (x) => x % 2 === 0 ? Result.succeed(x) : Result.fail(x)\n)\nconsole.log(result) // [[1, 3, 5], [2, 4]]';
const moduleRecord = A as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const input = [1, 2, 3, 4, 5];
  const result = A.partitionMap(input, (x) => (x % 2 === 0 ? Result.succeed(x) : Result.fail(x)));
  const [failures, successes] = result;

  yield* Console.log(`A.partitionMap([1, 2, 3, 4, 5], parity) => ${JSON.stringify(result)}`);
  yield* Console.log(`failures=${JSON.stringify(failures)} successes=${JSON.stringify(successes)}`);
});

const exampleCurriedIndexAwareInvocation = Effect.gen(function* () {
  const classifyByIndex = A.partitionMap((value: string, index) =>
    index % 2 === 0 ? Result.fail(`${index}:${value}`) : Result.succeed(value.toUpperCase())
  );

  const [indexTaggedFailures, uppercasedSuccesses] = classifyByIndex(["beep", "boop", "bop", "buzz"]);

  yield* Console.log(
    `A.partitionMap((value, index) => ...)(["beep","boop","bop","buzz"]) => ${JSON.stringify([indexTaggedFailures, uppercasedSuccesses])}`
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
      description: "Map odd numbers to failures and even numbers to successes with the documented call shape.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Curried Index-Aware Invocation",
      description: "Use the data-last form and callback index to route values into failure or success outputs.",
      run: exampleCurriedIndexAwareInvocation,
    },
  ],
});

BunRuntime.runMain(program);
