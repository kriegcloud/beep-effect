/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: andThen
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:14:16.770Z
 *
 * Overview:
 * A flexible variant of {@link flatMap} that accepts multiple input shapes.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Result } from "effect"
 *
 * // With a function returning a Result
 * const a = pipe(
 *   Result.succeed(1),
 *   Result.andThen((n) => Result.succeed(n + 1))
 * )
 *
 * // With a plain mapping function
 * const b = pipe(
 *   Result.succeed(1),
 *   Result.andThen((n) => n + 1)
 * )
 *
 * // With a constant value
 * const c = pipe(Result.succeed(1), Result.andThen("done"))
 *
 * console.log(a, b, c)
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "andThen";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "A flexible variant of {@link flatMap} that accepts multiple input shapes.";
const sourceExample =
  'import { pipe, Result } from "effect"\n\n// With a function returning a Result\nconst a = pipe(\n  Result.succeed(1),\n  Result.andThen((n) => Result.succeed(n + 1))\n)\n\n// With a plain mapping function\nconst b = pipe(\n  Result.succeed(1),\n  Result.andThen((n) => n + 1)\n)\n\n// With a constant value\nconst c = pipe(Result.succeed(1), Result.andThen("done"))\n\nconsole.log(a, b, c)';
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
  bunContext: BunContext,
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
