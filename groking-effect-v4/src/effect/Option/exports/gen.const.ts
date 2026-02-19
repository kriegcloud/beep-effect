/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: gen
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:14:15.453Z
 *
 * Overview:
 * Generator-based syntax for `Option`, similar to `async`/`await` but for optional values. Yielding a `None` short-circuits the generator to `None`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 * 
 * const maybeName: Option.Option<string> = Option.some("John")
 * const maybeAge: Option.Option<number> = Option.some(25)
 * 
 * const person = Option.gen(function*() {
 *   const name = (yield* maybeName).toUpperCase()
 *   const age = yield* maybeAge
 *   return { name, age }
 * })
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
const exportName = "gen";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Generator-based syntax for `Option`, similar to `async`/`await` but for optional values. Yielding a `None` short-circuits the generator to `None`.";
const sourceExample = "import { Option } from \"effect\"\n\nconst maybeName: Option.Option<string> = Option.some(\"John\")\nconst maybeAge: Option.Option<number> = Option.some(25)\n\nconst person = Option.gen(function*() {\n  const name = (yield* maybeName).toUpperCase()\n  const age = yield* maybeAge\n  return { name, age }\n})\n\nconsole.log(person)\n// Output:\n// { _id: 'Option', _tag: 'Some', value: { name: 'JOHN', age: 25 } }";
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
