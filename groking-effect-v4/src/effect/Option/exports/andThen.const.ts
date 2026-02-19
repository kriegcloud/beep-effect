/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: andThen
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.080Z
 *
 * Overview:
 * Chains a second computation onto an `Option`. The second value can be a plain value, an `Option`, or a function returning either.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * // Chain with a function returning Option
 * console.log(Option.andThen(Option.some(5), (x) => Option.some(x * 2)))
 * // Output: { _id: 'Option', _tag: 'Some', value: 10 }
 *
 * // Chain with a static value
 * console.log(Option.andThen(Option.some(5), "hello"))
 * // Output: { _id: 'Option', _tag: 'Some', value: "hello" }
 *
 * // Chain with None - skips
 * console.log(Option.andThen(Option.none(), (x) => Option.some(x * 2)))
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
const exportName = "andThen";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "Chains a second computation onto an `Option`. The second value can be a plain value, an `Option`, or a function returning either.";
const sourceExample =
  "import { Option } from \"effect\"\n\n// Chain with a function returning Option\nconsole.log(Option.andThen(Option.some(5), (x) => Option.some(x * 2)))\n// Output: { _id: 'Option', _tag: 'Some', value: 10 }\n\n// Chain with a static value\nconsole.log(Option.andThen(Option.some(5), \"hello\"))\n// Output: { _id: 'Option', _tag: 'Some', value: \"hello\" }\n\n// Chain with None - skips\nconsole.log(Option.andThen(Option.none(), (x) => Option.some(x * 2)))\n// Output: { _id: 'Option', _tag: 'None' }";
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.andThen as a runtime value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeOption = <A>(option: O.Option<A>): string =>
  O.match({
    onNone: () => "None",
    onSome: (value) => `Some(${JSON.stringify(value)})`,
  })(option);

const exampleFunctionContinuation = Effect.gen(function* () {
  yield* Console.log("Chain with continuation functions.");
  const returnsOption = O.andThen(O.some(5), (n) => O.some(n * 2));
  const returnsValue = O.andThen(O.some(5), (n) => n * 2);

  yield* Console.log(`function -> Option: ${summarizeOption(returnsOption)}`);
  yield* Console.log(`function -> value: ${summarizeOption(returnsValue)}`);
});

const exampleStaticValueAndShortCircuit = Effect.gen(function* () {
  yield* Console.log("Chain with static inputs and observe None short-circuiting.");
  const staticValue = O.andThen(O.some(5), "hello");
  const staticOption = O.andThen(O.some(5), O.some("already optional"));
  const fromNone = O.andThen(O.none<number>(), (n) => O.some(n * 2));

  yield* Console.log(`static value: ${summarizeOption(staticValue)}`);
  yield* Console.log(`static Option: ${summarizeOption(staticOption)}`);
  yield* Console.log(`from None: ${summarizeOption(fromNone)}`);
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
      title: "Function Continuation",
      description: "Apply andThen with functions that return Option and plain values.",
      run: exampleFunctionContinuation,
    },
    {
      title: "Static Inputs and None",
      description: "Use non-function inputs and show that None skips continuation work.",
      run: exampleStaticValueAndShortCircuit,
    },
  ],
});

BunRuntime.runMain(program);
