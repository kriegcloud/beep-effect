/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: filterMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.080Z
 *
 * Overview:
 * Alias of {@link flatMap}. Applies a function returning `Option` to the value inside a `Some`, flattening the result.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.filterMap(
 *   Option.some(2),
 *   (n) => (n % 2 === 0 ? Option.some(`Even: ${n}`) : Option.none())
 * ))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'Even: 2' }
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
const exportName = "filterMap";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary =
  "Alias of {@link flatMap}. Applies a function returning `Option` to the value inside a `Some`, flattening the result.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconsole.log(Option.filterMap(\n  Option.some(2),\n  (n) => (n % 2 === 0 ? Option.some(`Even: ${n}`) : Option.none())\n))\n// Output: { _id: 'Option', _tag: 'Some', value: 'Even: 2' }";
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
