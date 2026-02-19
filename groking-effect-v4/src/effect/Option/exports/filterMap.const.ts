/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: filterMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.080Z
 *
 * Overview:
 * Alias of {@link flatMap}. Applies a function returning `Option` to the value inside a `Some`, flattening the result.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.filterMap(
 *   Option.some(2),
 *   (n) => (n % 2 === 0 ? Option.some(`Even: ${n}`) : Option.none())
 * ))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'Even: 2' }
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
const exportName = "filterMap";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "Alias of {@link flatMap}. Applies a function returning `Option` to the value inside a `Some`, flattening the result.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconsole.log(Option.filterMap(\n  Option.some(2),\n  (n) => (n % 2 === 0 ? Option.some(`Even: ${n}`) : Option.none())\n))\n// Output: { _id: 'Option', _tag: 'Some', value: 'Even: 2' }";
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.filterMap as a runtime value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const filterEvenNumbers = (n: number): O.Option<string> => (n % 2 === 0 ? O.some(`Even: ${n}`) : O.none());

const exampleSourceAlignedEvenFilter = Effect.gen(function* () {
  yield* Console.log("Map Some values with an Option-returning even check.");
  const evenInput = O.filterMap(O.some(2), filterEvenNumbers);
  const oddInput = O.filterMap(O.some(3), filterEvenNumbers);
  const noneInput = O.filterMap(O.none<number>(), filterEvenNumbers);

  yield* Console.log(`some(2) -> ${formatUnknown(evenInput)}`);
  yield* Console.log(`some(3) -> ${formatUnknown(oddInput)}`);
  yield* Console.log(`none() -> ${formatUnknown(noneInput)}`);
});

const exampleCurriedReuse = Effect.gen(function* () {
  yield* Console.log("Reuse data-last filterMap to keep labels with a numeric suffix.");
  const keepVersionedLabel = O.filterMap((label: string) =>
    /\d$/.test(label) ? O.some(label.toUpperCase()) : O.none<string>()
  );

  const withSuffix = keepVersionedLabel(O.some("beep2"));
  const withoutSuffix = keepVersionedLabel(O.some("beep"));
  const fromNone = keepVersionedLabel(O.none<string>());

  yield* Console.log(`keepVersionedLabel(some("beep2")) -> ${formatUnknown(withSuffix)}`);
  yield* Console.log(`keepVersionedLabel(some("beep")) -> ${formatUnknown(withoutSuffix)}`);
  yield* Console.log(`keepVersionedLabel(none()) -> ${formatUnknown(fromNone)}`);
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
      title: "Source-Aligned Even Mapping",
      description: "Run the JSDoc-style even-number mapping and compare Some/None outcomes.",
      run: exampleSourceAlignedEvenFilter,
    },
    {
      title: "Curried Reuse",
      description: "Prebuild a data-last filterMap and reuse it across present and absent values.",
      run: exampleCurriedReuse,
    },
  ],
});

BunRuntime.runMain(program);
