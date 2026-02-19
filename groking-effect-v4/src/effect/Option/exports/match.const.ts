/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Option
 * Export: match
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Option.ts
 * Generated: 2026-02-19T04:14:15.454Z
 *
 * Overview:
 * Pattern-matches on an `Option`, handling both `None` and `Some` cases.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option } from "effect"
 *
 * const message = Option.match(Option.some(1), {
 *   onNone: () => "Option is empty",
 *   onSome: (value) => `Option has a value: ${value}`
 * })
 *
 * console.log(message)
 * // Output: "Option has a value: 1"
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
const exportName = "match";
const exportKind = "const";
const moduleImportPath = "effect/Option";
const sourceSummary = "Pattern-matches on an `Option`, handling both `None` and `Some` cases.";
const sourceExample =
  'import { Option } from "effect"\n\nconst message = Option.match(Option.some(1), {\n  onNone: () => "Option is empty",\n  onSome: (value) => `Option has a value: ${value}`\n})\n\nconsole.log(message)\n// Output: "Option has a value: 1"';
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
