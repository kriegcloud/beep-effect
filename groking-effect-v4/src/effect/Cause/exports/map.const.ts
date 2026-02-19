/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: map
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.193Z
 *
 * Overview:
 * Transforms the typed error values inside a {@link Cause} using the provided function. Only {@link Fail} reasons are affected; {@link Die} and {@link Interrupt} reasons pass through unchanged.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.fail("error")
 * const mapped = Cause.map(cause, (e) => e.toUpperCase())
 * const reason = mapped.reasons[0]
 * if (Cause.isFailReason(reason)) {
 *   console.log(reason.error) // "ERROR"
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "map";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "Transforms the typed error values inside a {@link Cause} using the provided function. Only {@link Fail} reasons are affected; {@link Die} and {@link Interrupt} reasons pass thro...";
const sourceExample =
  'import { Cause } from "effect"\n\nconst cause = Cause.fail("error")\nconst mapped = Cause.map(cause, (e) => e.toUpperCase())\nconst reason = mapped.reasons[0]\nif (Cause.isFailReason(reason)) {\n  console.log(reason.error) // "ERROR"\n}';
const moduleRecord = CauseModule as Record<string, unknown>;

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
