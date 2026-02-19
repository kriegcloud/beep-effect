/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Data
 * Export: Error
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Data.ts
 * Generated: 2026-02-19T04:14:11.232Z
 *
 * Overview:
 * Create a structured error constructor that supports Effect's error handling.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect } from "effect"
 *
 * class NetworkError extends Data.Error<{ code: number; message: string }> {}
 *
 * const program = Effect.gen(function*() {
 *   yield* new NetworkError({ code: 500, message: "Server error" })
 * })
 *
 * Effect.runSync(Effect.exit(program))
 * // Exit.fail(NetworkError({ code: 500, message: "Server error" }))
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
import * as DataModule from "effect/Data";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Error";
const exportKind = "const";
const moduleImportPath = "effect/Data";
const sourceSummary = "Create a structured error constructor that supports Effect's error handling.";
const sourceExample =
  'import { Data, Effect } from "effect"\n\nclass NetworkError extends Data.Error<{ code: number; message: string }> {}\n\nconst program = Effect.gen(function*() {\n  yield* new NetworkError({ code: 500, message: "Server error" })\n})\n\nEffect.runSync(Effect.exit(program))\n// Exit.fail(NetworkError({ code: 500, message: "Server error" }))';
const moduleRecord = DataModule as Record<string, unknown>;

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
