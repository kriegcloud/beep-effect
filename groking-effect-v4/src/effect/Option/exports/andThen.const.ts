/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: andThen
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:14:15.452Z
 *
 * Overview:
 * Chains a second computation onto an `Option`. The second value can be a plain value, an `Option`, or a function returning either.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 * 
 * // Chain with a function returning Option
 * console.log(Option.andThen(Option.some(5), (x) => Option.some(x * 2)))
 * // Output: { _id: 'Option', _tag: 'Some', value: 10 }
 * 
 * // Chain with a static value
 * console.log(Option.andThen(Option.some(5), "hello"))
 * // Output: { _id: 'Option', _tag: 'Some', value: "hello" }
 * 
 * // Chain with None - skips
 * console.log(Option.andThen(Option.none(), (x) => Option.some(x * 2)))
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
const exportName = "andThen";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Chains a second computation onto an `Option`. The second value can be a plain value, an `Option`, or a function returning either.";
const sourceExample = "import { Option } from \"effect\"\n\n// Chain with a function returning Option\nconsole.log(Option.andThen(Option.some(5), (x) => Option.some(x * 2)))\n// Output: { _id: 'Option', _tag: 'Some', value: 10 }\n\n// Chain with a static value\nconsole.log(Option.andThen(Option.some(5), \"hello\"))\n// Output: { _id: 'Option', _tag: 'Some', value: \"hello\" }\n\n// Chain with None - skips\nconsole.log(Option.andThen(Option.none(), (x) => Option.some(x * 2)))\n// Output: { _id: 'Option', _tag: 'None' }";
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
