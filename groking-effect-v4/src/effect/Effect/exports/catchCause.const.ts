/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: catchCause
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.386Z
 *
 * Overview:
 * Handles both recoverable and unrecoverable errors by providing a recovery effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Console, Effect } from "effect"
 * 
 * // An effect that might fail in different ways
 * const program = Effect.die("Something went wrong")
 * 
 * // Recover from any cause (including defects)
 * const recovered = Effect.catchCause(program, (cause) => {
 *   if (Cause.hasDies(cause)) {
 *     return Console.log("Caught defect").pipe(
 *       Effect.as("Recovered from defect")
 *     )
 *   }
 *   return Effect.succeed("Unknown error")
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as EffectModule from "effect/Effect";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "catchCause";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Handles both recoverable and unrecoverable errors by providing a recovery effect.";
const sourceExample = "import { Cause, Console, Effect } from \"effect\"\n\n// An effect that might fail in different ways\nconst program = Effect.die(\"Something went wrong\")\n\n// Recover from any cause (including defects)\nconst recovered = Effect.catchCause(program, (cause) => {\n  if (Cause.hasDies(cause)) {\n    return Console.log(\"Caught defect\").pipe(\n      Effect.as(\"Recovered from defect\")\n    )\n  }\n  return Effect.succeed(\"Unknown error\")\n})";
const moduleRecord = EffectModule as Record<string, unknown>;

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
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
