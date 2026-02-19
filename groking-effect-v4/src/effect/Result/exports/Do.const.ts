/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: Do
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Starting point for the "do notation" simulation with `Result`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Result } from "effect"
 *
 * const result = pipe(
 *   Result.Do,
 *   Result.bind("x", () => Result.succeed(2)),
 *   Result.bind("y", () => Result.succeed(3)),
 *   Result.let("sum", ({ x, y }) => x + y)
 * )
 * console.log(result)
 * // Output: { _tag: "Success", success: { x: 2, y: 3, sum: 5 }, ... }
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
import * as Effect from "effect/Effect";
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Do";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = 'Starting point for the "do notation" simulation with `Result`.';
const sourceExample =
  'import { pipe, Result } from "effect"\n\nconst result = pipe(\n  Result.Do,\n  Result.bind("x", () => Result.succeed(2)),\n  Result.bind("y", () => Result.succeed(3)),\n  Result.let("sum", ({ x, y }) => x + y)\n)\nconsole.log(result)\n// Output: { _tag: "Success", success: { x: 2, y: 3, sum: 5 }, ... }';
const moduleRecord = ResultModule as Record<string, unknown>;

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
