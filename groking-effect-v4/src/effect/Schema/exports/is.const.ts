/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schema
 * Export: is
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schema.ts
 * Generated: 2026-02-19T04:14:18.710Z
 *
 * Overview:
 * Creates a type guard function that checks if a value conforms to a given schema.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 *
 * const isString = Schema.is(Schema.String)
 *
 * console.log(isString("hello")) // true
 * console.log(isString(42)) // false
 *
 * // Type narrowing in action
 * const value: unknown = "hello"
 * if (isString(value)) {
 *   // value is now typed as string
 *   console.log(value.toUpperCase()) // "HELLO"
 * }
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
import * as SchemaModule from "effect/Schema";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "is";
const exportKind = "const";
const moduleImportPath = "effect/Schema";
const sourceSummary = "Creates a type guard function that checks if a value conforms to a given schema.";
const sourceExample =
  'import { Schema } from "effect"\n\nconst isString = Schema.is(Schema.String)\n\nconsole.log(isString("hello")) // true\nconsole.log(isString(42)) // false\n\n// Type narrowing in action\nconst value: unknown = "hello"\nif (isString(value)) {\n  // value is now typed as string\n  console.log(value.toUpperCase()) // "HELLO"\n}';
const moduleRecord = SchemaModule as Record<string, unknown>;

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
