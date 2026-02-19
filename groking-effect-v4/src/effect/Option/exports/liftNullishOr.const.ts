/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: liftNullishOr
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Lifts a function that may return `null` or `undefined` into one that returns an `Option`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * const parse = (s: string): number | undefined => {
 *   const n = parseFloat(s)
 *   return isNaN(n) ? undefined : n
 * }
 *
 * const parseOption = Option.liftNullishOr(parse)
 *
 * console.log(parseOption("1"))
 * // Output: { _id: 'Option', _tag: 'Some', value: 1 }
 *
 * console.log(parseOption("not a number"))
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
const exportName = "liftNullishOr";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Lifts a function that may return `null` or `undefined` into one that returns an `Option`.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconst parse = (s: string): number | undefined => {\n  const n = parseFloat(s)\n  return isNaN(n) ? undefined : n\n}\n\nconst parseOption = Option.liftNullishOr(parse)\n\nconsole.log(parseOption(\"1\"))\n// Output: { _id: 'Option', _tag: 'Some', value: 1 }\n\nconsole.log(parseOption(\"not a number\"))\n// Output: { _id: 'Option', _tag: 'None' }";
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect liftNullishOr before applying it to domain functions.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const formatOption = (option: O.Option<unknown>): string =>
  O.match(option, {
    onNone: () => "None",
    onSome: (value) => `Some(${formatUnknown(value)})`,
  });

const exampleSourceAlignedParsing = Effect.gen(function* () {
  const parse = (s: string): number | undefined => {
    const n = Number.parseFloat(s);
    return Number.isNaN(n) ? undefined : n;
  };
  const parseOption = O.liftNullishOr(parse);
  const inputs = ["1", "3.14", "not a number"] as const;

  for (const input of inputs) {
    yield* Console.log(`parseOption(${formatUnknown(input)}) -> ${formatOption(parseOption(input))}`);
  }
});

const exampleNullishCollapse = Effect.gen(function* () {
  const getDisplayName = O.liftNullishOr((id: number): string | null | undefined => {
    if (id === 1) {
      return "Ada";
    }
    if (id === 2) {
      return null;
    }
    return undefined;
  });

  for (const id of [1, 2, 3] as const) {
    yield* Console.log(`getDisplayName(${id}) -> ${formatOption(getDisplayName(id))}`);
  }
  yield* Console.log("null and undefined both become None.");
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
      title: "Source-Aligned Parsing Lift",
      description: "Lift a parse function so invalid numeric input becomes None.",
      run: exampleSourceAlignedParsing,
    },
    {
      title: "Nullish Return Normalization",
      description: "Show that both null and undefined results are normalized to None.",
      run: exampleNullishCollapse,
    },
  ],
});

BunRuntime.runMain(program);
