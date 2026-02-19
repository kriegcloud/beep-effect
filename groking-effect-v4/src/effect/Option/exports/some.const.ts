/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: some
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.082Z
 *
 * Overview:
 * Wraps the given value into an `Option` to represent its presence.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * //      ┌─── Option<number>
 * //      ▼
 * const value = Option.some(1)
 *
 * console.log(value)
 * // Output: { _id: 'Option', _tag: 'Some', value: 1 }
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
const exportName = "some";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Wraps the given value into an `Option` to represent its presence.";
const sourceExample =
  "import { Option } from \"effect\"\n\n//      ┌─── Option<number>\n//      ▼\nconst value = Option.some(1)\n\nconsole.log(value)\n// Output: { _id: 'Option', _tag: 'Some', value: 1 }";
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect Option.some as a runtime function export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedSomeValue = Effect.gen(function* () {
  const value = O.some(1);

  yield* Console.log(`O.some(1) => ${formatUnknown(value)}`);
  yield* Console.log(`O.isSome(O.some(1)) => ${O.isSome(value)}`);
});

const exampleSomeWrapsPresentValues = Effect.gen(function* () {
  const someNull = O.some<null>(null);
  const someConfig = O.some({ retries: 2, mode: "safe" as const });
  const mappedRetries = O.map(O.some(2), (retries) => retries + 1);

  yield* Console.log(`O.some(null) => ${formatUnknown(someNull)}`);
  yield* Console.log(`O.some(config) => ${formatUnknown(someConfig)}`);
  yield* Console.log(`O.map(O.some(2), n => n + 1) => ${formatUnknown(mappedRetries)}`);
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
      title: "Source JSDoc Behavior",
      description: "Run the documented Option.some(1) invocation and inspect the resulting Some value.",
      run: exampleSourceAlignedSomeValue,
    },
    {
      title: "Some Wraps Present Values",
      description: "Show that some keeps provided values (including null) and composes with downstream transforms.",
      run: exampleSomeWrapsPresentValues,
    },
  ],
});

BunRuntime.runMain(program);
