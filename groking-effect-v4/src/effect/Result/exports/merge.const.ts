/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: merge
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:14:16.772Z
 *
 * Overview:
 * Unwraps a `Result` into `A | E` by returning the inner value regardless of whether it is a success or failure.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 *
 * console.log(Result.merge(Result.succeed(42)))
 * // Output: 42
 *
 * console.log(Result.merge(Result.fail("error")))
 * // Output: "error"
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
const exportName = "merge";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary =
  "Unwraps a `Result` into `A | E` by returning the inner value regardless of whether it is a success or failure.";
const sourceExample =
  'import { Result } from "effect"\n\nconsole.log(Result.merge(Result.succeed(42)))\n// Output: 42\n\nconsole.log(Result.merge(Result.fail("error")))\n// Output: "error"';
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
