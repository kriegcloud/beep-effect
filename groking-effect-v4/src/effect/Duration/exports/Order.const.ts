/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Duration
 * Export: Order
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Duration.ts
 * Generated: 2026-02-19T04:14:11.324Z
 *
 * Overview:
 * Order instance for `Duration`, allowing comparison operations.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Duration } from "effect"
 *
 * const durations = [
 *   Duration.seconds(3),
 *   Duration.seconds(1),
 *   Duration.seconds(2)
 * ]
 * const sorted = durations.sort((a, b) => Duration.Order(a, b))
 * console.log(sorted.map(Duration.toSeconds)) // [1, 2, 3]
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
const exportName = "Order";
const exportKind = "const";
const moduleImportPath = "effect/Duration";
const sourceSummary = "Order instance for `Duration`, allowing comparison operations.";
const sourceExample =
  'import { Duration } from "effect"\n\nconst durations = [\n  Duration.seconds(3),\n  Duration.seconds(1),\n  Duration.seconds(2)\n]\nconst sorted = durations.sort((a, b) => Duration.Order(a, b))\nconsole.log(sorted.map(Duration.toSeconds)) // [1, 2, 3]';
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
