/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: toRefinement
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:14:15.454Z
 *
 * Overview:
 * Converts an `Option`-returning function into a type guard (refinement).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 * 
 * type MyData = string | number
 * 
 * const parseString = (data: MyData): Option.Option<string> =>
 *   typeof data === "string" ? Option.some(data) : Option.none()
 * 
 * //      ┌─── (a: MyData) => a is string
 * //      ▼
 * const isString = Option.toRefinement(parseString)
 * 
 * console.log(isString("a"))
 * // Output: true
 * 
 * console.log(isString(1))
 * // Output: false
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
const exportName = "toRefinement";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Converts an `Option`-returning function into a type guard (refinement).";
const sourceExample = "import { Option } from \"effect\"\n\ntype MyData = string | number\n\nconst parseString = (data: MyData): Option.Option<string> =>\n  typeof data === \"string\" ? Option.some(data) : Option.none()\n\n//      ┌─── (a: MyData) => a is string\n//      ▼\nconst isString = Option.toRefinement(parseString)\n\nconsole.log(isString(\"a\"))\n// Output: true\n\nconsole.log(isString(1))\n// Output: false";
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
