/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: fromIterable
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Wraps the first element of an `Iterable` in a `Some`, or returns `None` if the iterable is empty.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.fromIterable([1, 2, 3]))
 * // Output: { _id: 'Option', _tag: 'Some', value: 1 }
 *
 * console.log(Option.fromIterable([]))
 * // Output: { _id: 'Option', _tag: 'None' }
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
const exportName = "fromIterable";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "Wraps the first element of an `Iterable` in a `Some`, or returns `None` if the iterable is empty.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconsole.log(Option.fromIterable([1, 2, 3]))\n// Output: { _id: 'Option', _tag: 'Some', value: 1 }\n\nconsole.log(Option.fromIterable([]))\n// Output: { _id: 'Option', _tag: 'None' }";
const moduleRecord = O as Record<string, unknown>;

const formatOption = <A>(option: O.Option<A>): string =>
  O.match({
    onNone: () => "None",
    onSome: (value) => `Some(${JSON.stringify(value)})`,
  })(option);

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.fromIterable as a runtime value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedHeadExtraction = Effect.gen(function* () {
  yield* Console.log("Use array input to get the first value; empty input yields None.");
  const fromNonEmpty = O.fromIterable([1, 2, 3]);
  const fromEmpty = O.fromIterable<number>([]);

  yield* Console.log(`fromIterable([1, 2, 3]) => ${formatOption(fromNonEmpty)}`);
  yield* Console.log(`fromIterable([]) => ${formatOption(fromEmpty)}`);
});

const exampleLazyIterableSingleStep = Effect.gen(function* () {
  yield* Console.log("Only the first yielded element is consumed from a lazy iterable.");
  const visited: Array<string> = [];

  function* numbers(): Iterable<number> {
    visited.push("yield-10");
    yield 10;
    visited.push("yield-20");
    yield 20;
  }

  const result = O.fromIterable(numbers());
  yield* Console.log(`visited markers: ${visited.join(" -> ")}`);
  yield* Console.log(`result => ${formatOption(result)}`);
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
      title: "Source-Aligned Head Extraction",
      description: "Reproduce the documented non-empty and empty iterable behavior.",
      run: exampleSourceAlignedHeadExtraction,
    },
    {
      title: "Lazy Iterable First-Element Consumption",
      description: "Show that fromIterable stops after the first yielded element.",
      run: exampleLazyIterableSingleStep,
    },
  ],
});

BunRuntime.runMain(program);
