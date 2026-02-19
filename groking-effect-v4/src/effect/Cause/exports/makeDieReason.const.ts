/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: makeDieReason
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.193Z
 *
 * Overview:
 * Creates a standalone {@link Die} reason (not wrapped in a {@link Cause}).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const reason = Cause.makeDieReason(new Error("bug"))
 * console.log(reason._tag) // "Die"
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
const exportName = "makeDieReason";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary = "Creates a standalone {@link Die} reason (not wrapped in a {@link Cause}).";
const sourceExample =
  'import { Cause } from "effect"\n\nconst reason = Cause.makeDieReason(new Error("bug"))\nconsole.log(reason._tag) // "Die"';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect makeDieReason as a function export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleSourceAlignedDieReason = Effect.gen(function* () {
  const defect = new Error("bug");
  const reason = CauseModule.makeDieReason(defect);

  yield* Console.log(`reason tag: ${reason._tag}`);
  yield* Console.log(`defect preserved by reference: ${reason.defect === defect}`);
  yield* Console.log(`isReason / isDieReason: ${CauseModule.isReason(reason)} / ${CauseModule.isDieReason(reason)}`);
});

const exampleStandaloneReasonUsage = Effect.gen(function* () {
  const reason = CauseModule.makeDieReason("panic");
  const cause = CauseModule.fromReasons([reason]);
  const firstReason = cause.reasons[0];
  const storedDefect = CauseModule.isDieReason(firstReason) ? String(firstReason.defect) : "n/a";

  yield* Console.log(`isCause(reason): ${CauseModule.isCause(reason)}`);
  yield* Console.log(`cause reasons: ${cause.reasons.length}`);
  yield* Console.log(`same reason instance in cause: ${firstReason === reason}`);
  yield* Console.log(`stored defect: ${storedDefect}`);
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
      title: "Source-Aligned Die Reason",
      description: "Run the documented constructor call and verify Die-specific runtime fields.",
      run: exampleSourceAlignedDieReason,
    },
    {
      title: "Standalone Reason Usage",
      description: "Show that makeDieReason returns a Reason and how to wrap it into a Cause.",
      run: exampleStandaloneReasonUsage,
    },
  ],
});

BunRuntime.runMain(program);
