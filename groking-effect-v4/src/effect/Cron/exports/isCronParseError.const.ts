/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cron
 * Export: isCronParseError
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cron.ts
 * Generated: 2026-02-19T04:50:34.556Z
 *
 * Overview:
 * Checks if a given value is a CronParseError instance.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cron, Result } from "effect"
 *
 * const result = Cron.parse("invalid cron expression")
 * if (Result.isFailure(result)) {
 *   const error = result.failure
 *   console.log(Cron.isCronParseError(error)) // true
 * }
 *
 * console.log(Cron.isCronParseError(new Error("regular error"))) // false
 * console.log(Cron.isCronParseError("not an error")) // false
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
import * as Console from "effect/Console";
import * as CronModule from "effect/Cron";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isCronParseError";
const exportKind = "const";
const moduleImportPath = "effect/Cron";
const sourceSummary = "Checks if a given value is a CronParseError instance.";
const sourceExample =
  'import { Cron, Result } from "effect"\n\nconst result = Cron.parse("invalid cron expression")\nif (Result.isFailure(result)) {\n  const error = result.failure\n  console.log(Cron.isCronParseError(error)) // true\n}\n\nconsole.log(Cron.isCronParseError(new Error("regular error"))) // false\nconsole.log(Cron.isCronParseError("not an error")) // false';
const moduleRecord = CronModule as Record<string, unknown>;

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
