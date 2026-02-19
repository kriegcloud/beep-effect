/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: effectify
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.908Z
 *
 * Overview:
 * Converts a callback-based function to a function that returns an `Effect`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as fs from "fs"
 *
 * // Convert Node.js readFile to an Effect
 * const readFile = Effect.effectify(fs.readFile)
 *
 * // Use the effectified function
 * const program = readFile("package.json", "utf8")
 *
 * Effect.runPromise(program).then(console.log)
 * // Output: contents of package.json
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "effectify";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Converts a callback-based function to a function that returns an `Effect`.";
const sourceExample =
  'import { Effect } from "effect"\nimport * as fs from "fs"\n\n// Convert Node.js readFile to an Effect\nconst readFile = Effect.effectify(fs.readFile)\n\n// Use the effectified function\nconst program = readFile("package.json", "utf8")\n\nEffect.runPromise(program).then(console.log)\n// Output: contents of package.json';
const moduleRecord = EffectModule as Record<string, unknown>;

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
