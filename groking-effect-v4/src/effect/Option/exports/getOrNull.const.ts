/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: getOrNull
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Extracts the value from a `Some`, or returns `null` for `None`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.getOrNull(Option.some(1)))
 * // Output: 1
 *
 * console.log(Option.getOrNull(Option.none()))
 * // Output: null
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
const exportName = "getOrNull";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Extracts the value from a `Some`, or returns `null` for `None`.";
const sourceExample =
  'import { Option } from "effect"\n\nconsole.log(Option.getOrNull(Option.some(1)))\n// Output: 1\n\nconsole.log(Option.getOrNull(Option.none()))\n// Output: null';
const moduleRecord = O as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect `getOrNull` as a runtime value.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSomeReturnsInnerValue = Effect.gen(function* () {
  const result = O.getOrNull(O.some(1));
  yield* Console.log("Some(1) unwraps to the inner value.");
  yield* Console.log(`Result: ${String(result)}`);
});

const exampleNoneReturnsNull = Effect.gen(function* () {
  const result = O.getOrNull(O.none<number>());
  yield* Console.log("None becomes null.");
  yield* Console.log(`Result: ${String(result)}`);
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
      title: "Some Unwrap",
      description: "Use `getOrNull` with `Some` and verify the wrapped value is returned.",
      run: exampleSomeReturnsInnerValue,
    },
    {
      title: "None Fallback",
      description: "Use `getOrNull` with `None` and verify it returns `null`.",
      run: exampleNoneReturnsNull,
    },
  ],
});

BunRuntime.runMain(program);
