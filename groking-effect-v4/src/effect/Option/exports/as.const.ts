/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: as
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.080Z
 *
 * Overview:
 * Replaces the value inside a `Some` with a constant, leaving `None` unchanged.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.as(Option.some(42), "new value"))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'new value' }
 *
 * console.log(Option.as(Option.none(), "new value"))
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
const exportName = "as";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Replaces the value inside a `Some` with a constant, leaving `None` unchanged.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconsole.log(Option.as(Option.some(42), \"new value\"))\n// Output: { _id: 'Option', _tag: 'Some', value: 'new value' }\n\nconsole.log(Option.as(Option.none(), \"new value\"))\n// Output: { _id: 'Option', _tag: 'None' }";
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.as as a runtime value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const summarizeOption = <A>(option: O.Option<A>): string =>
  O.match({
    onNone: () => "None",
    onSome: (value) => `Some(${JSON.stringify(value)})`,
  })(option);

const exampleReplaceSomeValue = Effect.gen(function* () {
  yield* Console.log("Replace a Some payload with a constant value.");
  const input = O.some(42);
  const replaced = O.as(input, "new value");

  yield* Console.log(`input: ${summarizeOption(input)}`);
  yield* Console.log(`replaced: ${summarizeOption(replaced)}`);
});

const exampleNoneAndDataLast = Effect.gen(function* () {
  yield* Console.log("None stays None; data-last invocation yields the same replacement.");
  const fromNone = O.as(O.none<number>(), "new value");
  const dataLast = O.as("new value")(O.some(7));

  yield* Console.log(`from None: ${summarizeOption(fromNone)}`);
  yield* Console.log(`data-last Some: ${summarizeOption(dataLast)}`);
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
      title: "Replace Some Value",
      description: "Use Option.as to replace a Some payload with a constant.",
      run: exampleReplaceSomeValue,
    },
    {
      title: "None Passthrough and Data-last",
      description: "Show None passthrough and the curried data-last invocation form.",
      run: exampleNoneAndDataLast,
    },
  ],
});

BunRuntime.runMain(program);
