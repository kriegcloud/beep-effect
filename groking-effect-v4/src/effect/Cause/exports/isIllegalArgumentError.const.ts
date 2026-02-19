/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: isIllegalArgumentError
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.192Z
 *
 * Overview:
 * Tests if an arbitrary value is an {@link IllegalArgumentError}.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.isIllegalArgumentError(new Cause.IllegalArgumentError())) // true
 * console.log(Cause.isIllegalArgumentError("nope")) // false
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
const exportName = "isIllegalArgumentError";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Tests if an arbitrary value is an {@link IllegalArgumentError}.";
const sourceExample =
  'import { Cause } from "effect"\n\nconsole.log(Cause.isIllegalArgumentError(new Cause.IllegalArgumentError())) // true\nconsole.log(Cause.isIllegalArgumentError("nope")) // false';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime shape to confirm this export is a callable type guard.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedInvocation = Effect.gen(function* () {
  const illegal = new CauseModule.IllegalArgumentError("Expected positive number");
  const notIllegal = "nope";

  yield* Console.log(
    `Cause.isIllegalArgumentError(new Cause.IllegalArgumentError(...)): ${CauseModule.isIllegalArgumentError(illegal)}`
  );
  yield* Console.log(`Cause.isIllegalArgumentError("nope"): ${CauseModule.isIllegalArgumentError(notIllegal)}`);
});

const exampleErrorDiscrimination = Effect.gen(function* () {
  const illegal = new CauseModule.IllegalArgumentError("Expected non-empty input");
  const timeout = new CauseModule.TimeoutError("Operation timed out");
  const generic = new Error("boom");

  yield* Console.log(
    `Illegal/Timeout/Error: ${CauseModule.isIllegalArgumentError(illegal)} / ${CauseModule.isIllegalArgumentError(timeout)} / ${CauseModule.isIllegalArgumentError(generic)}`
  );
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
      description: "Inspect module export count, runtime type, and formatted preview for this type guard.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Source-Aligned Invocation",
      description: "Run the documented checks with IllegalArgumentError input and a non-error value.",
      run: exampleSourceAlignedInvocation,
    },
    {
      title: "Error Discrimination",
      description: "Show that the guard accepts IllegalArgumentError and rejects other error kinds.",
      run: exampleErrorDiscrimination,
    },
  ],
});

BunRuntime.runMain(program);
