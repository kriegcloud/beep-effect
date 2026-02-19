/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: zipLeft
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.083Z
 *
 * Overview:
 * Sequences two `Option`s, keeping the value from the first if both are `Some`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.zipLeft(Option.some("hello"), Option.some(1)))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'hello' }
 *
 * console.log(Option.zipLeft(Option.some("hello"), Option.none()))
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
const exportName = "zipLeft";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Sequences two `Option`s, keeping the value from the first if both are `Some`.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconsole.log(Option.zipLeft(Option.some(\"hello\"), Option.some(1)))\n// Output: { _id: 'Option', _tag: 'Some', value: 'hello' }\n\nconsole.log(Option.zipLeft(Option.some(\"hello\"), Option.none()))\n// Output: { _id: 'Option', _tag: 'None' }";
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const bothSome = O.zipLeft(O.some("hello"), O.some(1));
  const missingRight = O.zipLeft(O.some("hello"), O.none());

  yield* Console.log(`some("hello") zipLeft some(1) -> ${formatUnknown(bothSome)}`);
  yield* Console.log(`some("hello") zipLeft none() -> ${formatUnknown(missingRight)}`);
});

const exampleLeftValueIsPreserved = Effect.gen(function* () {
  const leftObject = { id: 1, label: "left" };
  const rightObject = { id: 2, label: "right" };
  const keepsLeft = O.zipLeft(O.some(leftObject), O.some(rightObject));
  const missingLeft = O.zipLeft(O.none<{ id: number; label: string }>(), O.some(rightObject));

  yield* Console.log(`left object kept when both Some -> ${formatUnknown(keepsLeft)}`);
  yield* Console.log(`none() on left short-circuits -> ${formatUnknown(missingLeft)}`);
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
      description: "Use the documented arguments to show Some propagation vs None on the right.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Left-Bias Semantics",
      description: "When both Options are Some, zipLeft keeps the left value and discards the right.",
      run: exampleLeftValueIsPreserved,
    },
  ],
});

BunRuntime.runMain(program);
