/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: fromUndefinedOr
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:14:15.453Z
 *
 * Overview:
 * Converts a possibly `undefined` value into an `Option`, leaving `null` as a valid `Some`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 * 
 * console.log(Option.fromUndefinedOr(undefined))
 * // Output: { _id: 'Option', _tag: 'None' }
 * 
 * console.log(Option.fromUndefinedOr(null))
 * // Output: { _id: 'Option', _tag: 'Some', value: null }
 * 
 * console.log(Option.fromUndefinedOr(42))
 * // Output: { _id: 'Option', _tag: 'Some', value: 42 }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as OptionModule from "effect/Option";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromUndefinedOr";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Converts a possibly `undefined` value into an `Option`, leaving `null` as a valid `Some`.";
const sourceExample = "import { Option } from \"effect\"\n\nconsole.log(Option.fromUndefinedOr(undefined))\n// Output: { _id: 'Option', _tag: 'None' }\n\nconsole.log(Option.fromUndefinedOr(null))\n// Output: { _id: 'Option', _tag: 'Some', value: null }\n\nconsole.log(Option.fromUndefinedOr(42))\n// Output: { _id: 'Option', _tag: 'Some', value: 42 }";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
