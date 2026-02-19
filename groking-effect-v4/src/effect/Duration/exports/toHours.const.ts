/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Duration
 * Export: toHours
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Duration.ts
 * Generated: 2026-02-19T04:14:11.324Z
 *
 * Overview:
 * Converts a Duration to hours.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Duration } from "effect"
 *
 * console.log(Duration.toHours(Duration.minutes(120))) // 2
 * console.log(Duration.toHours(Duration.days(1))) // 24
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
const exportName = "toHours";
const exportKind = "const";
const moduleImportPath = "effect/Duration";
const sourceSummary = "Converts a Duration to hours.";
const sourceExample =
  'import { Duration } from "effect"\n\nconsole.log(Duration.toHours(Duration.minutes(120))) // 2\nconsole.log(Duration.toHours(Duration.days(1))) // 24';
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
