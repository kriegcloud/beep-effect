/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: isUnknownError
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.193Z
 *
 * Overview:
 * Tests if an arbitrary value is an {@link UnknownError}.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.isUnknownError(new Cause.UnknownError("x"))) // true
 * console.log(Cause.isUnknownError("nope")) // false
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
const exportName = "isUnknownError";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Tests if an arbitrary value is an {@link UnknownError}.";
const sourceExample =
  'import { Cause } from "effect"\n\nconsole.log(Cause.isUnknownError(new Cause.UnknownError("x"))) // true\nconsole.log(Cause.isUnknownError("nope")) // false';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  const target = moduleRecord[exportName];

  yield* Console.log("Inspect runtime shape to confirm this export is a callable type guard.");
  yield* inspectNamedExport({ moduleRecord, exportName });
  if (typeof target === "function") {
    yield* Console.log(`Callable predicate arity hint: ${target.length}`);
  }
});

const exampleSourceAlignedGuardCheck = Effect.gen(function* () {
  const unknown = new CauseModule.UnknownError("x");

  yield* Console.log(`isUnknownError(new Cause.UnknownError("x")): ${CauseModule.isUnknownError(unknown)}`);
  yield* Console.log(`isUnknownError("nope"): ${CauseModule.isUnknownError("nope")}`);
});

const exampleStructuralBrandCheck = Effect.gen(function* () {
  const brandKey = CauseModule.UnknownErrorTypeId;
  const unknown = new CauseModule.UnknownError({ raw: true }, "Unexpected value");
  const timeout = new CauseModule.TimeoutError("Timed out");
  const brandedPlainObject = { [brandKey]: brandKey, _tag: "UnknownError" };

  yield* Console.log(
    `Unknown/Timeout: ${CauseModule.isUnknownError(unknown)} / ${CauseModule.isUnknownError(timeout)}`
  );
  yield* Console.log(`Branded plain object: ${CauseModule.isUnknownError(brandedPlainObject)}`);
  yield* Console.log("Contract note: this guard is structural and checks for the unknown-error brand.");
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
      description: "Run the JSDoc scenario with an UnknownError and a non-matching value.",
      run: exampleSourceAlignedGuardCheck,
    },
    {
      title: "Structural Brand Check",
      description: "Compare UnknownError vs TimeoutError and show a branded object also satisfies the guard.",
      run: exampleStructuralBrandCheck,
    },
  ],
});

BunRuntime.runMain(program);
