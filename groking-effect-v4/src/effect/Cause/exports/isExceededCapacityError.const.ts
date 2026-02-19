/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: isExceededCapacityError
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.192Z
 *
 * Overview:
 * Tests if an arbitrary value is an {@link ExceededCapacityError}.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.isExceededCapacityError(new Cause.ExceededCapacityError())) // true
 * console.log(Cause.isExceededCapacityError("nope")) // false
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
const exportName = "isExceededCapacityError";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Tests if an arbitrary value is an {@link ExceededCapacityError}.";
const sourceExample =
  'import { Cause } from "effect"\n\nconsole.log(Cause.isExceededCapacityError(new Cause.ExceededCapacityError())) // true\nconsole.log(Cause.isExceededCapacityError("nope")) // false';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the guard export and verify that it is callable.");
  yield* inspectNamedExport({ moduleRecord, exportName });
  yield* Console.log(`Guard arity: ${CauseModule.isExceededCapacityError.length}`);
});

const exampleSourceAlignedGuardCheck = Effect.gen(function* () {
  const exceeded = new CauseModule.ExceededCapacityError("Queue full");

  yield* Console.log(
    `isExceededCapacityError(new ExceededCapacityError("Queue full")) => ${CauseModule.isExceededCapacityError(exceeded)}`
  );
  yield* Console.log(`isExceededCapacityError("nope") => ${CauseModule.isExceededCapacityError("nope")}`);
});

const exampleStructuralBrandCheck = Effect.gen(function* () {
  const brandKey = CauseModule.ExceededCapacityErrorTypeId;
  const exceeded = new CauseModule.ExceededCapacityError("Queue full");
  const timeout = new CauseModule.TimeoutError("Timed out");
  const brandedPlainObject = { [brandKey]: brandKey, _tag: "ExceededCapacityError" };

  yield* Console.log(
    `Exceeded/Timeout => ${CauseModule.isExceededCapacityError(exceeded)} / ${CauseModule.isExceededCapacityError(timeout)}`
  );
  yield* Console.log(`Branded plain object => ${CauseModule.isExceededCapacityError(brandedPlainObject)}`);
  yield* Console.log("Contract note: this guard is structural and checks for the brand property.");
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
      description: "Run the JSDoc scenario with an ExceededCapacityError and a non-matching value.",
      run: exampleSourceAlignedGuardCheck,
    },
    {
      title: "Structural Brand Check",
      description: "Compare Exceeded/Timeout errors and show that a branded object also satisfies the guard.",
      run: exampleStructuralBrandCheck,
    },
  ],
});

BunRuntime.runMain(program);
