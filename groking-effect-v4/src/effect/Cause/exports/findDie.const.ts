/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: findDie
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.184Z
 *
 * Overview:
 * Returns the first {@link Die} reason from a cause, including its annotations. Returns `Filter.fail` with the original cause when no `Die` is found.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Result } from "effect"
 *
 * const result = Cause.findDie(Cause.die("defect"))
 * if (!Result.isFailure(result)) {
 *   console.log(result.success.defect) // "defect"
 * }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "findDie";
const exportKind = "const";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "Returns the first {@link Die} reason from a cause, including its annotations. Returns `Filter.fail` with the original cause when no `Die` is found.";
const sourceExample =
  'import { Cause, Result } from "effect"\n\nconst result = Cause.findDie(Cause.die("defect"))\nif (!Result.isFailure(result)) {\n  console.log(result.success.defect) // "defect"\n}';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
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
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
