/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: fromNullishOr
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:50:38.081Z
 *
 * Overview:
 * Converts a nullable value (`null` or `undefined`) into an `Option`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.fromNullishOr(undefined))
 * // Output: { _id: 'Option', _tag: 'None' }
 *
 * console.log(Option.fromNullishOr(null))
 * // Output: { _id: 'Option', _tag: 'None' }
 *
 * console.log(Option.fromNullishOr(1))
 * // Output: { _id: 'Option', _tag: 'Some', value: 1 }
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
const exportName = "fromNullishOr";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Converts a nullable value (`null` or `undefined`) into an `Option`.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconsole.log(Option.fromNullishOr(undefined))\n// Output: { _id: 'Option', _tag: 'None' }\n\nconsole.log(Option.fromNullishOr(null))\n// Output: { _id: 'Option', _tag: 'None' }\n\nconsole.log(Option.fromNullishOr(1))\n// Output: { _id: 'Option', _tag: 'Some', value: 1 }";
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
