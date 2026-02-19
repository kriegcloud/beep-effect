/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: isNoSuchElementError
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.192Z
 *
 * Overview:
 * Tests if an arbitrary value is a {@link NoSuchElementError}.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.isNoSuchElementError(new Cause.NoSuchElementError())) // true
 * console.log(Cause.isNoSuchElementError("nope")) // false
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
const exportName = "isNoSuchElementError";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Tests if an arbitrary value is a {@link NoSuchElementError}.";
const sourceExample =
  'import { Cause } from "effect"\n\nconsole.log(Cause.isNoSuchElementError(new Cause.NoSuchElementError())) // true\nconsole.log(Cause.isNoSuchElementError("nope")) // false';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  const target = moduleRecord[exportName];

  yield* Console.log("Inspect runtime shape, then run the source-documented predicate checks.");
  yield* inspectNamedExport({ moduleRecord, exportName });
  if (typeof target === "function") {
    yield* Console.log(`Callable predicate arity hint: ${target.length}`);
  }

  yield* Console.log(
    `isNoSuchElementError(new Cause.NoSuchElementError()): ${CauseModule.isNoSuchElementError(new CauseModule.NoSuchElementError())}`
  );
  yield* Console.log(`isNoSuchElementError("nope"): ${CauseModule.isNoSuchElementError("nope")}`);
});

const exampleErrorDiscrimination = Effect.gen(function* () {
  const noSuch = new CauseModule.NoSuchElementError("Missing user profile");
  const timeout = new CauseModule.TimeoutError("Timed out loading profile");
  const generic = new Error("Unknown failure");

  yield* Console.log(
    `NoSuch/Timeout/Error: ${CauseModule.isNoSuchElementError(noSuch)} / ${CauseModule.isNoSuchElementError(timeout)} / ${CauseModule.isNoSuchElementError(generic)}`
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
      title: "Runtime Shape + Source Invocation",
      description: "Inspect the predicate export and run the source JSDoc true/false checks.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Error-Type Discrimination",
      description: "Show the guard accepts NoSuchElementError and rejects other error types.",
      run: exampleErrorDiscrimination,
    },
  ],
});

BunRuntime.runMain(program);
