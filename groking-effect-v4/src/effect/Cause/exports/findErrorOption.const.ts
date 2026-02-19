/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: findErrorOption
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.184Z
 *
 * Overview:
 * Returns the first typed error value `E` from a cause wrapped in `Option.some`, or `Option.none` if no {@link Fail} reason exists.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Option } from "effect"
 *
 * const some = Cause.findErrorOption(Cause.fail("error"))
 * console.log(Option.isSome(some)) // true
 *
 * const none = Cause.findErrorOption(Cause.die("defect"))
 * console.log(Option.isNone(none)) // true
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
import * as O from "effect/Option";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "findErrorOption";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "Returns the first typed error value `E` from a cause wrapped in `Option.some`, or `Option.none` if no {@link Fail} reason exists.";
const sourceExample =
  'import { Cause, Option } from "effect"\n\nconst some = Cause.findErrorOption(Cause.fail("error"))\nconsole.log(Option.isSome(some)) // true\n\nconst none = Cause.findErrorOption(Cause.die("defect"))\nconsole.log(Option.isNone(none)) // true';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect findErrorOption as a callable export that searches for typed failures.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedOptionOutcomes = Effect.gen(function* () {
  yield* Console.log("Source-aligned behavior: fail causes produce Some, die causes produce None.");

  const fromFail = CauseModule.findErrorOption(CauseModule.fail("error"));
  const fromDie = CauseModule.findErrorOption(CauseModule.die("defect"));

  yield* Console.log(`from fail -> isSome: ${O.isSome(fromFail)}`);
  if (O.isSome(fromFail)) {
    yield* Console.log(`from fail -> value: ${fromFail.value}`);
  }

  yield* Console.log(`from die -> isNone: ${O.isNone(fromDie)}`);
});

const exampleMixedCauseSearch = Effect.gen(function* () {
  yield* Console.log("Mixed causes still return the typed fail value when one exists.");

  const typedError = { code: "E_PARSE", retriable: false };
  const mixedCause = CauseModule.combine(CauseModule.die(new Error("boom")), CauseModule.fail(typedError));
  const result = CauseModule.findErrorOption(mixedCause);

  yield* Console.log(`mixed cause has fails: ${CauseModule.hasFails(mixedCause)}`);
  yield* Console.log(`result isSome: ${O.isSome(result)}`);
  if (O.isSome(result)) {
    yield* Console.log(`extracted error: ${formatUnknown(result.value)}`);
    yield* Console.log(`error identity preserved: ${result.value === typedError}`);
  }
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
      title: "Source-Aligned Option Outcomes",
      description: "Run the documented fail/die inputs and verify Some vs None.",
      run: exampleSourceAlignedOptionOutcomes,
    },
    {
      title: "Mixed Cause Search",
      description: "Show that findErrorOption extracts a typed fail from a mixed cause.",
      run: exampleMixedCauseSearch,
    },
  ],
});

BunRuntime.runMain(program);
