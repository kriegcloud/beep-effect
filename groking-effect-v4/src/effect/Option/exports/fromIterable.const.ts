/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: fromIterable
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:14:15.452Z
 *
 * Overview:
 * Wraps the first element of an `Iterable` in a `Some`, or returns `None` if the iterable is empty.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.fromIterable([1, 2, 3]))
 * // Output: { _id: 'Option', _tag: 'Some', value: 1 }
 *
 * console.log(Option.fromIterable([]))
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as OptionModule from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromIterable";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "Wraps the first element of an `Iterable` in a `Some`, or returns `None` if the iterable is empty.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconsole.log(Option.fromIterable([1, 2, 3]))\n// Output: { _id: 'Option', _tag: 'Some', value: 1 }\n\nconsole.log(Option.fromIterable([]))\n// Output: { _id: 'Option', _tag: 'None' }";
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
  bunContext: BunContext,
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
