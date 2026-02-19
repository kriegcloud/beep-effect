/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: composeK
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:14:15.452Z
 *
 * Overview:
 * Composes two `Option`-returning functions into a single function that chains them together.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * const parse = (s: string): Option.Option<number> =>
 *   isNaN(Number(s)) ? Option.none() : Option.some(Number(s))
 *
 * const double = (n: number): Option.Option<number> =>
 *   n > 0 ? Option.some(n * 2) : Option.none()
 *
 * const parseAndDouble = Option.composeK(parse, double)
 *
 * console.log(parseAndDouble("42"))
 * // Output: { _id: 'Option', _tag: 'Some', value: 84 }
 *
 * console.log(parseAndDouble("not a number"))
 * // Output: { _id: 'Option', _tag: 'None' }
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
const exportName = "composeK";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Composes two `Option`-returning functions into a single function that chains them together.";
const sourceExample =
  "import { Option } from \"effect\"\n\nconst parse = (s: string): Option.Option<number> =>\n  isNaN(Number(s)) ? Option.none() : Option.some(Number(s))\n\nconst double = (n: number): Option.Option<number> =>\n  n > 0 ? Option.some(n * 2) : Option.none()\n\nconst parseAndDouble = Option.composeK(parse, double)\n\nconsole.log(parseAndDouble(\"42\"))\n// Output: { _id: 'Option', _tag: 'Some', value: 84 }\n\nconsole.log(parseAndDouble(\"not a number\"))\n// Output: { _id: 'Option', _tag: 'None' }";
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
