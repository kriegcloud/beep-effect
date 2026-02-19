/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: zipWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.083Z
 *
 * Overview:
 * Combines two `Option`s using a provided function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * const person = Option.zipWith(
 *   Option.some("John"),
 *   Option.some(25),
 *   (name, age) => ({ name: name.toUpperCase(), age })
 * )
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
const exportName = "zipWith";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Combines two `Option`s using a provided function.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconst person = Option.zipWith(\n  Option.some(\"John\"),\n  Option.some(25),\n  (name, age) => ({ name: name.toUpperCase(), age })\n)\n\nconsole.log(person)\n// Output:\n// { _id: 'Option', _tag: 'Some', value: { name: 'JOHN', age: 25 } }";
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.zipWith as a runtime value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const person = O.zipWith(O.some("John"), O.some(25), (name, age) => ({ name: name.toUpperCase(), age }));
  const missingAge = O.zipWith(O.some("John"), O.none<number>(), (name, age) => ({ name: name.toUpperCase(), age }));

  yield* Console.log(`some("John") + some(25) -> ${formatUnknown(person)}`);
  yield* Console.log(`some("John") + none() -> ${formatUnknown(missingAge)}`);
});

const exampleCombinerGuard = Effect.gen(function* () {
  let combinerCalls = 0;
  const combineLabel = (left: string, right: string) => {
    combinerCalls += 1;
    return `${left}:${right}`;
  };

  const missingLeft = O.zipWith(O.none<string>(), O.some("beta"), combineLabel);
  const bothSome = O.zipWith(O.some("alpha"), O.some("beta"), combineLabel);

  yield* Console.log(`none() + some("beta") -> ${formatUnknown(missingLeft)}`);
  yield* Console.log(`some("alpha") + some("beta") -> ${formatUnknown(bothSome)}`);
  yield* Console.log(`combiner calls: ${combinerCalls}`);
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
      description: "Combine two Some values and compare with None short-circuiting.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Combiner Call Guard",
      description: "Verify the combining function runs only when both inputs are Some.",
      run: exampleCombinerGuard,
    },
  ],
});

BunRuntime.runMain(program);
