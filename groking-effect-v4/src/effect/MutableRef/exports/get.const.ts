/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableRef
 * Export: get
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableRef.ts
 * Generated: 2026-02-19T04:50:37.857Z
 *
 * Overview:
 * Gets the current value of the MutableRef.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableRef } from "effect"
 *
 * const ref = MutableRef.make("hello")
 * console.log(MutableRef.get(ref)) // "hello"
 *
 * MutableRef.set(ref, "world")
 * console.log(MutableRef.get(ref)) // "world"
 *
 * // Reading complex objects
 * const config = MutableRef.make({ port: 3000, host: "localhost" })
 * const currentConfig = MutableRef.get(config)
 * console.log(currentConfig.port) // 3000
 *
 * // Multiple reads return the same value
 * const value1 = MutableRef.get(ref)
 * const value2 = MutableRef.get(ref)
 * console.log(value1 === value2) // true
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as MutableRefModule from "effect/MutableRef";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "get";
const exportKind = "const";
const moduleImportPath = "effect/MutableRef";
const sourceSummary = "Gets the current value of the MutableRef.";
const sourceExample =
  'import { MutableRef } from "effect"\n\nconst ref = MutableRef.make("hello")\nconsole.log(MutableRef.get(ref)) // "hello"\n\nMutableRef.set(ref, "world")\nconsole.log(MutableRef.get(ref)) // "world"\n\n// Reading complex objects\nconst config = MutableRef.make({ port: 3000, host: "localhost" })\nconst currentConfig = MutableRef.get(config)\nconsole.log(currentConfig.port) // 3000\n\n// Multiple reads return the same value\nconst value1 = MutableRef.get(ref)\nconst value2 = MutableRef.get(ref)\nconsole.log(value1 === value2) // true';
const moduleRecord = MutableRefModule as Record<string, unknown>;

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
