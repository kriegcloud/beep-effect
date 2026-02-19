/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: gen
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Generator-based syntax for `Option`, similar to `async`/`await` but for optional values. Yielding a `None` short-circuits the generator to `None`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * const maybeName: Option.Option<string> = Option.some("John")
 * const maybeAge: Option.Option<number> = Option.some(25)
 *
 * const person = Option.gen(function*() {
 *   const name = (yield* maybeName).toUpperCase()
 *   const age = yield* maybeAge
 *   return { name, age }
 * })
 *
 * console.log(person)
 * // Output:
 * // { _id: 'Option', _tag: 'Some', value: { name: 'JOHN', age: 25 } }
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

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "gen";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "Generator-based syntax for `Option`, similar to `async`/`await` but for optional values. Yielding a `None` short-circuits the generator to `None`.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconst maybeName: Option.Option<string> = Option.some(\"John\")\nconst maybeAge: Option.Option<number> = Option.some(25)\n\nconst person = Option.gen(function*() {\n  const name = (yield* maybeName).toUpperCase()\n  const age = yield* maybeAge\n  return { name, age }\n})\n\nconsole.log(person)\n// Output:\n// { _id: 'Option', _tag: 'Some', value: { name: 'JOHN', age: 25 } }";
const moduleRecord = O as Record<string, unknown>;
const summarizeOption = <A>(option: O.Option<A>): string =>
  O.match(option, {
    onNone: () => "None",
    onSome: (value) => `Some(${formatUnknown(value)})`,
  });

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.gen as a callable generator-composition helper.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedComposition = Effect.gen(function* () {
  yield* Console.log("Compose two Some values and transform one value inside the generator.");

  const maybeName: O.Option<string> = O.some("John");
  const maybeAge: O.Option<number> = O.some(25);

  const person = O.gen(function* () {
    const name = (yield* maybeName).toUpperCase();
    const age = yield* maybeAge;
    return { name, age };
  });

  yield* Console.log(`Option.gen person composition -> ${summarizeOption(person)}`);
});

const exampleNoneShortCircuit = Effect.gen(function* () {
  yield* Console.log("Yielding None short-circuits and skips the remainder of the generator.");
  let reachedAfterNone = false;

  const result = O.gen(function* () {
    yield* O.some("begin");
    yield* O.none<string>();
    reachedAfterNone = true;
    return "unreachable";
  });

  yield* Console.log(`Option.gen short-circuit -> ${summarizeOption(result)}`);
  yield* Console.log(`code after None reached: ${reachedAfterNone}`);
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
      title: "Source-Aligned Person Composition",
      description: "Use the documented generator pattern to combine Some values into one object.",
      run: exampleSourceAlignedComposition,
    },
    {
      title: "None Short-Circuit Semantics",
      description: "Show that yielding None returns None and prevents later generator code from running.",
      run: exampleNoneShortCircuit,
    },
  ],
});

BunRuntime.runMain(program);
