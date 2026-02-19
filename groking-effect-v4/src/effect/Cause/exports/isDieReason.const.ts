/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: isDieReason
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.192Z
 *
 * Overview:
 * Narrows a {@link Reason} to {@link Die}.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.die("defect")
 * const dies = cause.reasons.filter(Cause.isDieReason)
 * console.log(dies[0].defect) // "defect"
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
const exportName = "isDieReason";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Narrows a {@link Reason} to {@link Die}.";
const sourceExample =
  'import { Cause } from "effect"\n\nconst cause = Cause.die("defect")\nconst dies = cause.reasons.filter(Cause.isDieReason)\nconsole.log(dies[0].defect) // "defect"';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect isDieReason as a reason-level narrowing predicate.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedReasonFiltering = Effect.gen(function* () {
  yield* Console.log("Filter a die cause's reasons with isDieReason.");
  const cause = CauseModule.die("defect");
  const dies = cause.reasons.filter(CauseModule.isDieReason);

  yield* Console.log(`reason count: ${cause.reasons.length}`);
  yield* Console.log(`die count: ${dies.length}`);
  yield* Console.log(`first defect: ${dies[0]?.defect ?? "(none)"}`);
});

const exampleMixedReasonFiltering = Effect.gen(function* () {
  yield* Console.log("Keep only Die reasons from mixed reasons.");
  const cause = CauseModule.fromReasons([
    CauseModule.makeFailReason("validation-error"),
    CauseModule.makeDieReason("panic"),
    CauseModule.makeInterruptReason(7),
    CauseModule.makeDieReason(new Error("crash")),
  ]);
  const dies = cause.reasons.filter(CauseModule.isDieReason);

  yield* Console.log(`all tags: ${cause.reasons.map((reason) => reason._tag).join(", ")}`);
  yield* Console.log(`die count: ${dies.length}`);
  yield* Console.log(`die defects: ${dies.map((reason) => String(reason.defect)).join(" | ")}`);
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
      title: "Source-Aligned Die Filtering",
      description: "Reproduce the documented die-cause filtering flow and inspect the extracted defect.",
      run: exampleSourceAlignedReasonFiltering,
    },
    {
      title: "Mixed Reason Filtering",
      description: "Apply isDieReason to a cause containing fail, interrupt, and die reasons.",
      run: exampleMixedReasonFiltering,
    },
  ],
});

BunRuntime.runMain(program);
