/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: isTimeoutError
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.193Z
 *
 * Overview:
 * Tests if an arbitrary value is a {@link TimeoutError}.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.isTimeoutError(new Cause.TimeoutError())) // true
 * console.log(Cause.isTimeoutError("nope")) // false
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import { createPlaygroundProgram, inspectNamedExport } from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isTimeoutError";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Tests if an arbitrary value is a {@link TimeoutError}.";
const sourceExample =
  'import { Cause } from "effect"\n\nconsole.log(Cause.isTimeoutError(new Cause.TimeoutError())) // true\nconsole.log(Cause.isTimeoutError("nope")) // false';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the guard export and verify that it is callable.");
  yield* inspectNamedExport({ moduleRecord, exportName });
  yield* Console.log(`Guard arity: ${CauseModule.isTimeoutError.length}`);
});

const exampleSourceAlignedGuardCheck = Effect.gen(function* () {
  const timeout = new CauseModule.TimeoutError("Timed out");

  yield* Console.log(`isTimeoutError(new TimeoutError("Timed out")) => ${CauseModule.isTimeoutError(timeout)}`);
  yield* Console.log(`isTimeoutError("nope") => ${CauseModule.isTimeoutError("nope")}`);
});

const exampleStructuralBrandCheck = Effect.gen(function* () {
  const brandKey = CauseModule.TimeoutErrorTypeId;
  const timeout = new CauseModule.TimeoutError("Timed out");
  const noSuch = new CauseModule.NoSuchElementError("Missing value");
  const brandedPlainObject = { [brandKey]: brandKey, _tag: "TimeoutError" };

  yield* Console.log(
    `Timeout/NoSuch => ${CauseModule.isTimeoutError(timeout)} / ${CauseModule.isTimeoutError(noSuch)}`
  );
  yield* Console.log(`Branded plain object => ${CauseModule.isTimeoutError(brandedPlainObject)}`);
  yield* Console.log("Contract note: this guard is structural and checks for the timeout brand.");
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
      description: "Inspect module export count, runtime type, preview, and function arity.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Guard Check",
      description: "Run the JSDoc scenario with a TimeoutError and a non-matching value.",
      run: exampleSourceAlignedGuardCheck,
    },
    {
      title: "Structural Brand Check",
      description: "Compare Timeout/NoSuch errors and show that a branded object also satisfies the guard.",
      run: exampleStructuralBrandCheck,
    },
  ],
});

BunRuntime.runMain(program);
