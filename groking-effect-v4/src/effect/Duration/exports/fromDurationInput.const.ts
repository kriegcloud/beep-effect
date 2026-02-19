/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Duration
 * Export: fromDurationInput
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Duration.ts
 * Generated: 2026-02-19T04:14:11.323Z
 *
 * Overview:
 * Safely decodes a `DurationInput` value into a `Duration`, returning `undefined` if decoding fails.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Duration } from "effect"
 *
 * Duration.fromDurationInput(1000)?.pipe(Duration.toSeconds) // 1
 *
 * Duration.fromDurationInput("invalid" as any) // undefined
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
import * as DurationModule from "effect/Duration";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromDurationInput";
const exportKind = "const";
const moduleImportPath = "effect/Duration";
const sourceSummary =
  "Safely decodes a `DurationInput` value into a `Duration`, returning `undefined` if decoding fails.";
const sourceExample =
  'import { Duration } from "effect"\n\nDuration.fromDurationInput(1000)?.pipe(Duration.toSeconds) // 1\n\nDuration.fromDurationInput("invalid" as any) // undefined';
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
