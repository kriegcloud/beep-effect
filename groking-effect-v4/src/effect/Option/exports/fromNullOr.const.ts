/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: fromNullOr
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:14:15.453Z
 *
 * Overview:
 * Converts a possibly `null` value into an `Option`, leaving `undefined` as a valid `Some`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.fromNullOr(null))
 * // Output: { _id: 'Option', _tag: 'None' }
 *
 * console.log(Option.fromNullOr(undefined))
 * // Output: { _id: 'Option', _tag: 'Some', value: undefined }
 *
 * console.log(Option.fromNullOr(42))
 * // Output: { _id: 'Option', _tag: 'Some', value: 42 }
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
const exportName = "fromNullOr";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Converts a possibly `null` value into an `Option`, leaving `undefined` as a valid `Some`.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconsole.log(Option.fromNullOr(null))\n// Output: { _id: 'Option', _tag: 'None' }\n\nconsole.log(Option.fromNullOr(undefined))\n// Output: { _id: 'Option', _tag: 'Some', value: undefined }\n\nconsole.log(Option.fromNullOr(42))\n// Output: { _id: 'Option', _tag: 'Some', value: 42 }";
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
