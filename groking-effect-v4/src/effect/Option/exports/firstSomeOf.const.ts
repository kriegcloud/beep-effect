/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: firstSomeOf
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.080Z
 *
 * Overview:
 * Returns the first `Some` found in an iterable of `Option`s, or `None` if all are `None`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.firstSomeOf([
 *   Option.none(),
 *   Option.some(1),
 *   Option.some(2)
 * ]))
 * // Output: { _id: 'Option', _tag: 'Some', value: 1 }
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
const exportName = "firstSomeOf";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Returns the first `Some` found in an iterable of `Option`s, or `None` if all are `None`.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconsole.log(Option.firstSomeOf([\n  Option.none(),\n  Option.some(1),\n  Option.some(2)\n]))\n// Output: { _id: 'Option', _tag: 'Some', value: 1 }";
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
  yield* Console.log("Inspect Option.firstSomeOf as a callable runtime export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAligned = Effect.gen(function* () {
  yield* Console.log("Pick the first Some from a left-to-right priority list.");
  const found = O.firstSomeOf([O.none<number>(), O.some(1), O.some(2)]);
  const missing = O.firstSomeOf([O.none<number>(), O.none<number>()]);

  yield* Console.log(`firstSomeOf([None, Some(1), Some(2)]) => ${formatOption(found)}`);
  yield* Console.log(`firstSomeOf([None, None]) => ${formatOption(missing)}`);
});

const exampleShortCircuit = Effect.gen(function* () {
  yield* Console.log("Iteration stops after the first Some is discovered.");
  const visited: Array<string> = [];

  function* candidates(): Iterable<O.Option<string>> {
    visited.push("fallback-1");
    yield O.none();
    visited.push("primary");
    yield O.some("hit");
    visited.push("fallback-2");
    yield O.some("unused");
  }

  const first = O.firstSomeOf(candidates());
  yield* Console.log(`visited: ${visited.join(" -> ")}`);
  yield* Console.log(`result => ${formatOption(first)}`);
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
      title: "Source-Aligned Priority Search",
      description: "Run the documented array scenario plus the all-None fallback.",
      run: exampleSourceAligned,
    },
    {
      title: "Iterable Short-Circuit Behavior",
      description: "Show that iteration halts once the first Some is found.",
      run: exampleShortCircuit,
    },
  ],
});

BunRuntime.runMain(program);
