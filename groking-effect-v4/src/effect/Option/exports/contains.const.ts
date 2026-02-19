/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: contains
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:14:15.452Z
 *
 * Overview:
 * Checks if an `Option` contains a value equal to the given one, using default structural equality.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 * 
 * console.log(Option.some(2).pipe(Option.contains(2)))
 * // Output: true
 * 
 * console.log(Option.some(1).pipe(Option.contains(2)))
 * // Output: false
 * 
 * console.log(Option.none().pipe(Option.contains(2)))
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
const exportName = "contains";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Checks if an `Option` contains a value equal to the given one, using default structural equality.";
const sourceExample = "import { Option } from \"effect\"\n\nconsole.log(Option.some(2).pipe(Option.contains(2)))\n// Output: true\n\nconsole.log(Option.some(1).pipe(Option.contains(2)))\n// Output: false\n\nconsole.log(Option.none().pipe(Option.contains(2)))\n// Output: false";
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
