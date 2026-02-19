/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Duration
 * Export: fromDurationInputUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Duration.ts
 * Generated: 2026-02-19T04:50:34.675Z
 *
 * Overview:
 * Decodes a `DurationInput` into a `Duration`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Duration } from "effect"
 *
 * const duration1 = Duration.fromDurationInputUnsafe(1000) // 1000 milliseconds
 * const duration2 = Duration.fromDurationInputUnsafe("5 seconds")
 * const duration3 = Duration.fromDurationInputUnsafe([2, 500_000_000]) // 2 seconds and 500ms
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
import * as DurationModule from "effect/Duration";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromDurationInputUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Duration";
const sourceSummary = "Decodes a `DurationInput` into a `Duration`.";
const sourceExample =
  'import { Duration } from "effect"\n\nconst duration1 = Duration.fromDurationInputUnsafe(1000) // 1000 milliseconds\nconst duration2 = Duration.fromDurationInputUnsafe("5 seconds")\nconst duration3 = Duration.fromDurationInputUnsafe([2, 500_000_000]) // 2 seconds and 500ms';
const moduleRecord = DurationModule as Record<string, unknown>;

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
