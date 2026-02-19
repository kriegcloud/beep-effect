/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: lift2
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Lifts a binary function to operate on two `Option` values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * const addOptions = Option.lift2((a: number, b: number) => a + b)
 *
 * console.log(addOptions(Option.some(2), Option.some(3)))
 * // Output: { _id: 'Option', _tag: 'Some', value: 5 }
 *
 * console.log(addOptions(Option.some(2), Option.none()))
 * // Output: { _id: 'Option', _tag: 'None' }
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
const exportName = "lift2";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Lifts a binary function to operate on two `Option` values.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconst addOptions = Option.lift2((a: number, b: number) => a + b)\n\nconsole.log(addOptions(Option.some(2), Option.some(3)))\n// Output: { _id: 'Option', _tag: 'Some', value: 5 }\n\nconsole.log(addOptions(Option.some(2), Option.none()))\n// Output: { _id: 'Option', _tag: 'None' }";
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const addOptions = O.lift2((a: number, b: number) => a + b);
  const bothSome = addOptions(O.some(2), O.some(3));
  const rightNone = addOptions(O.some(2), O.none());

  yield* Console.log(`some(2) + some(3) -> ${formatUnknown(bothSome)}`);
  yield* Console.log(`some(2) + none() -> ${formatUnknown(rightNone)}`);
});

const exampleCombinerRunsOnlyForSomeValues = Effect.gen(function* () {
  let combinerCalls = 0;
  const mergeLabels = O.lift2((left: string, right: string) => {
    combinerCalls += 1;
    return `${left}:${right}`;
  });

  const missingLeft = mergeLabels(O.none(), O.some("beta"));
  const bothPresent = mergeLabels(O.some("alpha"), O.some("beta"));

  yield* Console.log(`none() + some("beta") -> ${formatUnknown(missingLeft)}`);
  yield* Console.log(`some("alpha") + some("beta") -> ${formatUnknown(bothPresent)}`);
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
      description: "Lift addition and observe Some propagation vs None short-circuiting.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Combiner Call Guard",
      description: "The binary combiner runs only when both Option inputs are Some.",
      run: exampleCombinerRunsOnlyForSomeValues,
    },
  ],
});

BunRuntime.runMain(program);
