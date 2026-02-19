/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: all
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.080Z
 *
 * Overview:
 * Combines a structure of `Option`s (tuple, struct, or iterable) into a single `Option` containing the unwrapped structure.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * const maybeName: Option.Option<string> = Option.some("John")
 * const maybeAge: Option.Option<number> = Option.some(25)
 *
 * //      ┌─── Option<[string, number]>
 * //      ▼
 * const tuple = Option.all([maybeName, maybeAge])
 * console.log(tuple)
 * // Output:
 * // { _id: 'Option', _tag: 'Some', value: [ 'John', 25 ] }
 *
 * //      ┌─── Option<{ name: string; age: number; }>
 * //      ▼
 * const struct = Option.all({ name: maybeName, age: maybeAge })
 * console.log(struct)
 * // Output:
 * // { _id: 'Option', _tag: 'Some', value: { name: 'John', age: 25 } }
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
const exportName = "all";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "Combines a structure of `Option`s (tuple, struct, or iterable) into a single `Option` containing the unwrapped structure.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconst maybeName: Option.Option<string> = Option.some(\"John\")\nconst maybeAge: Option.Option<number> = Option.some(25)\n\n//      ┌─── Option<[string, number]>\n//      ▼\nconst tuple = Option.all([maybeName, maybeAge])\nconsole.log(tuple)\n// Output:\n// { _id: 'Option', _tag: 'Some', value: [ 'John', 25 ] }\n\n//      ┌─── Option<{ name: string; age: number; }>\n//      ▼\nconst struct = Option.all({ name: maybeName, age: maybeAge })\nconsole.log(struct)\n// Output:\n// { _id: 'Option', _tag: 'Some', value: { name: 'John', age: 25 } }";
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
  yield* Console.log("Inspect Option.all as a callable runtime export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleTupleCollection = Effect.gen(function* () {
  yield* Console.log("Collect tuple elements; None in any slot short-circuits.");
  const allSome = O.all([O.some("John"), O.some(25)] as const);
  const withNone = O.all([O.some("John"), O.none<number>()] as const);

  yield* Console.log(`all([Some("John"), Some(25)]) => ${formatOption(allSome)}`);
  yield* Console.log(`all([Some("John"), None]) => ${formatOption(withNone)}`);
});

const exampleStructCollection = Effect.gen(function* () {
  yield* Console.log("Collect struct fields into one Option record.");
  const allSome = O.all({
    name: O.some("John"),
    age: O.some(25),
  });
  const withNone = O.all({
    name: O.some("John"),
    age: O.none<number>(),
  });

  yield* Console.log(`all({ name: Some, age: Some }) => ${formatOption(allSome)}`);
  yield* Console.log(`all({ name: Some, age: None }) => ${formatOption(withNone)}`);
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
      title: "Tuple Collection Semantics",
      description: "Demonstrate success and short-circuit behavior for tuple inputs.",
      run: exampleTupleCollection,
    },
    {
      title: "Struct Collection Semantics",
      description: "Demonstrate success and short-circuit behavior for struct inputs.",
      run: exampleStructCollection,
    },
  ],
});

BunRuntime.runMain(program);
