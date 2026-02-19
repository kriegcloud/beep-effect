/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: zipWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.083Z
 *
 * Overview:
 * Combines two `Option`s using a provided function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * const person = Option.zipWith(
 *   Option.some("John"),
 *   Option.some(25),
 *   (name, age) => ({ name: name.toUpperCase(), age })
 * )
 *
 * console.log(person)
 * // Output:
 * // { _id: 'Option', _tag: 'Some', value: { name: 'JOHN', age: 25 } }
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
const exportName = "zipWith";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Combines two `Option`s using a provided function.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconst person = Option.zipWith(\n  Option.some(\"John\"),\n  Option.some(25),\n  (name, age) => ({ name: name.toUpperCase(), age })\n)\n\nconsole.log(person)\n// Output:\n// { _id: 'Option', _tag: 'Some', value: { name: 'JOHN', age: 25 } }";
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
