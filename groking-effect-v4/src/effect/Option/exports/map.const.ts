/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: map
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * Transforms the value inside a `Some` using the provided function, leaving `None` unchanged.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.map(Option.some(2), (n) => n * 2))
 * // Output: { _id: 'Option', _tag: 'Some', value: 4 }
 *
 * console.log(Option.map(Option.none(), (n: number) => n * 2))
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
const exportName = "map";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Transforms the value inside a `Some` using the provided function, leaving `None` unchanged.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconsole.log(Option.map(Option.some(2), (n) => n * 2))\n// Output: { _id: 'Option', _tag: 'Some', value: 4 }\n\nconsole.log(Option.map(Option.none(), (n: number) => n * 2))\n// Output: { _id: 'Option', _tag: 'None' }";
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.map as a runtime value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const multiplyByTwo = (n: number) => n * 2;

const exampleSourceAlignedSomeAndNone = Effect.gen(function* () {
  yield* Console.log("Map Some values while preserving None.");
  const mappedSome = O.map(O.some(2), multiplyByTwo);
  const mappedNone = O.map(O.none<number>(), multiplyByTwo);

  yield* Console.log(`some(2) -> ${formatUnknown(mappedSome)}`);
  yield* Console.log(`none() -> ${formatUnknown(mappedNone)}`);
});

const exampleDataLastReuse = Effect.gen(function* () {
  yield* Console.log("Reuse data-last map in a pipeline.");
  const toLabel = O.map((n: number) => `value:${n}`);

  const labeledSome = O.some(7).pipe(toLabel);
  const labeledNone = O.none<number>().pipe(toLabel);

  yield* Console.log(`some(7) -> ${formatUnknown(labeledSome)}`);
  yield* Console.log(`none() -> ${formatUnknown(labeledNone)}`);
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
      title: "Source-Aligned Some and None",
      description: "Apply the JSDoc mapping behavior to both present and absent values.",
      run: exampleSourceAlignedSomeAndNone,
    },
    {
      title: "Data-Last Reuse",
      description: "Prebuild a mapper and reuse it across Some and None inputs.",
      run: exampleDataLastReuse,
    },
  ],
});

BunRuntime.runMain(program);
