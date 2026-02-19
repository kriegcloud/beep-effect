/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: flatMapNullishOr
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:14:15.452Z
 *
 * Overview:
 * Combines {@link flatMap} with {@link fromNullishOr}: applies a function that may return `null`/`undefined` to the value of a `Some`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 * 
 * interface Employee {
 *   company?: { address?: { street?: { name?: string } } }
 * }
 * 
 * const emp: Employee = {
 *   company: { address: { street: { name: "high street" } } }
 * }
 * 
 * console.log(
 *   Option.some(emp).pipe(
 *     Option.flatMapNullishOr((e) => e.company?.address?.street?.name)
 *   )
 * )
 * // Output: { _id: 'Option', _tag: 'Some', value: 'high street' }
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
const exportName = "flatMapNullishOr";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Combines {@link flatMap} with {@link fromNullishOr}: applies a function that may return `null`/`undefined` to the value of a `Some`.";
const sourceExample = "import { Option } from \"effect\"\n\ninterface Employee {\n  company?: { address?: { street?: { name?: string } } }\n}\n\nconst emp: Employee = {\n  company: { address: { street: { name: \"high street\" } } }\n}\n\nconsole.log(\n  Option.some(emp).pipe(\n    Option.flatMapNullishOr((e) => e.company?.address?.street?.name)\n  )\n)\n// Output: { _id: 'Option', _tag: 'Some', value: 'high street' }";
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
