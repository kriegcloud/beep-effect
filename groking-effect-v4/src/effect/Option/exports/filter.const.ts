/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: filter
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.080Z
 *
 * Overview:
 * Filters an `Option` using a predicate. Returns `None` if the predicate is not satisfied or the input is `None`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * const removeEmpty = (input: Option.Option<string>) =>
 *   Option.filter(input, (value) => value !== "")
 *
 * console.log(removeEmpty(Option.some("hello")))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'hello' }
 *
 * console.log(removeEmpty(Option.some("")))
 * // Output: { _id: 'Option', _tag: 'None' }
 *
 * console.log(removeEmpty(Option.none()))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as OptionModule from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "filter";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "Filters an `Option` using a predicate. Returns `None` if the predicate is not satisfied or the input is `None`.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconst removeEmpty = (input: Option.Option<string>) =>\n  Option.filter(input, (value) => value !== \"\")\n\nconsole.log(removeEmpty(Option.some(\"hello\")))\n// Output: { _id: 'Option', _tag: 'Some', value: 'hello' }\n\nconsole.log(removeEmpty(Option.some(\"\")))\n// Output: { _id: 'Option', _tag: 'None' }\n\nconsole.log(removeEmpty(Option.none()))\n// Output: { _id: 'Option', _tag: 'None' }";
const moduleRecord = OptionModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
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
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
