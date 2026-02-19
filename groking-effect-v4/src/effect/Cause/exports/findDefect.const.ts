/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: findDefect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.184Z
 *
 * Overview:
 * Returns the first defect value (`unknown`) from a cause. Returns `Filter.fail` with the original cause when no {@link Die} reason is found.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Result } from "effect"
 *
 * const result = Cause.findDefect(Cause.die("defect"))
 * if (!Result.isFailure(result)) {
 *   console.log(result.success) // "defect"
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
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "findDefect";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "Returns the first defect value (`unknown`) from a cause. Returns `Filter.fail` with the original cause when no {@link Die} reason is found.";
const sourceExample =
  'import { Cause, Result } from "effect"\n\nconst result = Cause.findDefect(Cause.die("defect"))\nif (!Result.isFailure(result)) {\n  console.log(result.success) // "defect"\n}';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect findDefect as a callable export that searches causes for die reasons.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedDefectLookup = Effect.gen(function* () {
  yield* Console.log("Use the source-aligned call shape: pass a die cause and extract its defect.");

  const defect = { code: "E_UNEXPECTED", retriable: false };
  const result = CauseModule.findDefect(CauseModule.die(defect));

  yield* Console.log(`result is failure: ${ResultModule.isFailure(result)}`);
  if (!ResultModule.isFailure(result)) {
    yield* Console.log(`extracted defect: ${formatUnknown(result.success)}`);
    yield* Console.log(`defect identity preserved: ${result.success === defect}`);
  }
});

const exampleNoDefectContract = Effect.gen(function* () {
  yield* Console.log("When no Die reason exists, the result stays in the failure channel.");

  const typedFailureCause = CauseModule.combine(CauseModule.fail("typed-error"), CauseModule.interrupt(42));
  const result = CauseModule.findDefect(typedFailureCause);

  yield* Console.log(`result is failure: ${ResultModule.isFailure(result)}`);
  if (ResultModule.isFailure(result)) {
    yield* Console.log(`failure carries original cause: ${result.failure === typedFailureCause}`);
    yield* Console.log(`failure has typed errors: ${CauseModule.hasFails(result.failure)}`);
    yield* Console.log(`failure has defects: ${CauseModule.hasDies(result.failure)}`);
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
      title: "Source-Aligned Defect Lookup",
      description: "Call findDefect with a die cause and verify defect extraction semantics.",
      run: exampleSourceAlignedDefectLookup,
    },
    {
      title: "No-Defect Failure Contract",
      description: "Show the failure path when a cause has no die reason.",
      run: exampleNoDefectContract,
    },
  ],
});

BunRuntime.runMain(program);
