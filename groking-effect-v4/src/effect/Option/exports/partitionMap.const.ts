/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: partitionMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:14:15.454Z
 *
 * Overview:
 * Splits an `Option` into two `Option`s using a function that returns a `Result`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, Result } from "effect"
 * 
 * const parseNumber = (s: string): Result.Result<number, string> => {
 *   const n = Number(s)
 *   return isNaN(n) ? Result.fail("Not a number") : Result.succeed(n)
 * }
 * 
 * console.log(Option.partitionMap(Option.some("42"), parseNumber))
 * // Output: [{ _id: 'Option', _tag: 'None' }, { _id: 'Option', _tag: 'Some', value: 42 }]
 * 
 * console.log(Option.partitionMap(Option.some("abc"), parseNumber))
 * // Output: [{ _id: 'Option', _tag: 'Some', value: 'Not a number' }, { _id: 'Option', _tag: 'None' }]
 * 
 * console.log(Option.partitionMap(Option.none(), parseNumber))
 * // Output: [{ _id: 'Option', _tag: 'None' }, { _id: 'Option', _tag: 'None' }]
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
const exportName = "partitionMap";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Splits an `Option` into two `Option`s using a function that returns a `Result`.";
const sourceExample = "import { Option, Result } from \"effect\"\n\nconst parseNumber = (s: string): Result.Result<number, string> => {\n  const n = Number(s)\n  return isNaN(n) ? Result.fail(\"Not a number\") : Result.succeed(n)\n}\n\nconsole.log(Option.partitionMap(Option.some(\"42\"), parseNumber))\n// Output: [{ _id: 'Option', _tag: 'None' }, { _id: 'Option', _tag: 'Some', value: 42 }]\n\nconsole.log(Option.partitionMap(Option.some(\"abc\"), parseNumber))\n// Output: [{ _id: 'Option', _tag: 'Some', value: 'Not a number' }, { _id: 'Option', _tag: 'None' }]\n\nconsole.log(Option.partitionMap(Option.none(), parseNumber))\n// Output: [{ _id: 'Option', _tag: 'None' }, { _id: 'Option', _tag: 'None' }]";
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
