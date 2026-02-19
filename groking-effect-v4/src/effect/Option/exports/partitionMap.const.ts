/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: partitionMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * Splits an `Option` into two `Option`s using a function that returns a `Result`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, Result } from "effect"
 *
 * const parseNumber = (s: string): Result.Result<number, string> => {
 *   const n = Number(s)
 *   return isNaN(n) ? Result.fail("Not a number") : Result.succeed(n)
 * }
 *
 * console.log(Option.partitionMap(Option.some("42"), parseNumber))
 * // Output: [{ _id: 'Option', _tag: 'None' }, { _id: 'Option', _tag: 'Some', value: 42 }]
 *
 * console.log(Option.partitionMap(Option.some("abc"), parseNumber))
 * // Output: [{ _id: 'Option', _tag: 'Some', value: 'Not a number' }, { _id: 'Option', _tag: 'None' }]
 *
 * console.log(Option.partitionMap(Option.none(), parseNumber))
 * // Output: [{ _id: 'Option', _tag: 'None' }, { _id: 'Option', _tag: 'None' }]
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
import * as O from "effect/Option";
import * as Result from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "partitionMap";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Splits an `Option` into two `Option`s using a function that returns a `Result`.";
const sourceExample =
  "import { Option, Result } from \"effect\"\n\nconst parseNumber = (s: string): Result.Result<number, string> => {\n  const n = Number(s)\n  return isNaN(n) ? Result.fail(\"Not a number\") : Result.succeed(n)\n}\n\nconsole.log(Option.partitionMap(Option.some(\"42\"), parseNumber))\n// Output: [{ _id: 'Option', _tag: 'None' }, { _id: 'Option', _tag: 'Some', value: 42 }]\n\nconsole.log(Option.partitionMap(Option.some(\"abc\"), parseNumber))\n// Output: [{ _id: 'Option', _tag: 'Some', value: 'Not a number' }, { _id: 'Option', _tag: 'None' }]\n\nconsole.log(Option.partitionMap(Option.none(), parseNumber))\n// Output: [{ _id: 'Option', _tag: 'None' }, { _id: 'Option', _tag: 'None' }]";
const moduleRecord = O as Record<string, unknown>;

const formatOption = <A>(option: O.Option<A>): string =>
  O.match({
    onNone: () => "None",
    onSome: (value) => `Some(${formatUnknown(value)})`,
  })(option);

const formatPartition = <E, A>(partitioned: readonly [O.Option<E>, O.Option<A>]): string => {
  const [failures, successes] = partitioned;
  return `[failures: ${formatOption(failures)}, successes: ${formatOption(successes)}]`;
};

const parseNumber = (text: string): Result.Result<number, string> => {
  const parsed = Number(text);
  return Number.isNaN(parsed) ? Result.fail("Not a number") : Result.succeed(parsed);
};

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.partitionMap as a runtime function export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedPartition = Effect.gen(function* () {
  yield* Console.log("Partition Some values into failure and success Options.");
  const valid = O.partitionMap(O.some("42"), parseNumber);
  const invalid = O.partitionMap(O.some("abc"), parseNumber);

  yield* Console.log(`some("42") => ${formatPartition(valid)}`);
  yield* Console.log(`some("abc") => ${formatPartition(invalid)}`);
});

const exampleNoneShortCircuit = Effect.gen(function* () {
  yield* Console.log("None skips the mapper and returns [None, None].");
  let mapperCalls = 0;
  const trackedParser = (text: string): Result.Result<number, string> => {
    mapperCalls += 1;
    return parseNumber(text);
  };

  const fromNone = O.partitionMap(O.none<string>(), trackedParser);
  yield* Console.log(`none() => ${formatPartition(fromNone)} (mapper calls: ${mapperCalls})`);
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
      title: "Source-Aligned Partitioning",
      description: "Use Result.succeed / Result.fail to route Some values into output lanes.",
      run: exampleSourceAlignedPartition,
    },
    {
      title: "None Short-Circuit Behavior",
      description: "Show that None bypasses mapper execution and yields [None, None].",
      run: exampleNoneShortCircuit,
    },
  ],
});

BunRuntime.runMain(program);
