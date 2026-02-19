/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Formatter
 * Export: formatJson
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/Formatter.ts
 * Generated: 2026-02-19T04:14:13.269Z
 *
 * Overview:
 * Safely stringifies objects that may contain circular references.
 *
 * Source JSDoc Example:
 * ```ts
 * import { formatJson } from "effect/Formatter"
 *
 * // Normal object
 * const simple = { name: "Alice", age: 30 }
 * console.log(formatJson(simple))
 * // {"name":"Alice","age":30}
 *
 * // Object with circular reference
 * const circular: any = { name: "test" }
 * circular.self = circular
 * console.log(formatJson(circular))
 * // {"name":"test"} (circular reference omitted)
 *
 * // With formatting
 * console.log(formatJson(simple, { space: 2 }))
 * // {
 * //   "name": "Alice",
 * //   "age": 30
 * // }
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
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
import * as FormatterModule from "effect/Formatter";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "formatJson";
const exportKind = "function";
const moduleImportPath = "effect/Formatter";
const sourceSummary = "Safely stringifies objects that may contain circular references.";
const sourceExample =
  'import { formatJson } from "effect/Formatter"\n\n// Normal object\nconst simple = { name: "Alice", age: 30 }\nconsole.log(formatJson(simple))\n// {"name":"Alice","age":30}\n\n// Object with circular reference\nconst circular: any = { name: "test" }\ncircular.self = circular\nconsole.log(formatJson(circular))\n// {"name":"test"} (circular reference omitted)\n\n// With formatting\nconsole.log(formatJson(simple, { space: 2 }))\n// {\n//   "name": "Alice",\n//   "age": 30\n// }';
const moduleRecord = FormatterModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleFunctionInvocation = Effect.gen(function* () {
  yield* Console.log("Execute a safe zero-arg invocation probe.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery,
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation,
    },
  ],
});

BunRuntime.runMain(program);
