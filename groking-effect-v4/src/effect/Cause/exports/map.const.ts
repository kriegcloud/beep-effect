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

import { createPlaygroundProgram, formatUnknown, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
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
  yield* Console.log("Inspect map as a callable export with dual invocation forms.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedErrorTransform = Effect.gen(function* () {
  yield* Console.log("Use the source-aligned call shape: map Fail errors to uppercase.");

  const cause = CauseModule.fail("error");
  const mapped = CauseModule.map(cause, (error) => error.toUpperCase());
  const originalReason = cause.reasons[0];
  const mappedReason = mapped.reasons[0];

  yield* Console.log(`mapped returns new cause: ${mapped !== cause}`);
  if (originalReason !== undefined && CauseModule.isFailReason(originalReason)) {
    yield* Console.log(`original fail error: ${formatUnknown(originalReason.error)}`);
  }
  if (mappedReason !== undefined && CauseModule.isFailReason(mappedReason)) {
    yield* Console.log(`mapped fail error: ${formatUnknown(mappedReason.error)}`);
  }
});

const exampleNoFailPassThrough = Effect.gen(function* () {
  yield* Console.log("When no Fail reasons exist, map keeps Die/Interrupt reasons unchanged.");

  const dieReason = CauseModule.makeDieReason("defect");
  const interruptReason = CauseModule.makeInterruptReason(7);
  const causeWithoutFail = CauseModule.fromReasons([dieReason, interruptReason]);
  const mapped = CauseModule.map(causeWithoutFail, (error) => error);

  yield* Console.log(`result reference unchanged: ${mapped === causeWithoutFail}`);
  yield* Console.log(`reason count preserved: ${mapped.reasons.length === causeWithoutFail.reasons.length}`);
  yield* Console.log(`first reason is Die: ${mapped.reasons[0]?._tag === "Die"}`);
  yield* Console.log(`second reason is Interrupt: ${mapped.reasons[1]?._tag === "Interrupt"}`);
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
      title: "Source-Aligned Error Mapping",
      description: "Map a fail cause with the documented two-argument form and inspect the transformed error.",
      run: exampleSourceAlignedErrorTransform,
    },
    {
      title: "No-Fail Pass-Through",
      description: "Show that causes without Fail reasons are returned unchanged while Die/Interrupt remain intact.",
      run: exampleNoFailPassThrough,
    },
  ],
});

BunRuntime.runMain(program);
