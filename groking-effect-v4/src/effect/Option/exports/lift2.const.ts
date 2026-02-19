/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: lift2
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:14:15.453Z
 *
 * Overview:
 * Lifts a binary function to operate on two `Option` values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 * 
 * const addOptions = Option.lift2((a: number, b: number) => a + b)
 * 
 * console.log(addOptions(Option.some(2), Option.some(3)))
 * // Output: { _id: 'Option', _tag: 'Some', value: 5 }
 * 
 * console.log(addOptions(Option.some(2), Option.none()))
 * // Output: { _id: 'Option', _tag: 'None' }
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
const exportName = "lift2";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Lifts a binary function to operate on two `Option` values.";
const sourceExample = "import { Option } from \"effect\"\n\nconst addOptions = Option.lift2((a: number, b: number) => a + b)\n\nconsole.log(addOptions(Option.some(2), Option.some(3)))\n// Output: { _id: 'Option', _tag: 'Some', value: 5 }\n\nconsole.log(addOptions(Option.some(2), Option.none()))\n// Output: { _id: 'Option', _tag: 'None' }";
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
