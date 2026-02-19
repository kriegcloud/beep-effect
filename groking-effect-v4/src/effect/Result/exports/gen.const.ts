/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: gen
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:14:16.771Z
 *
 * Overview:
 * Generator-based syntax for composing `Result` values sequentially.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 *
 * const result = Result.gen(function*() {
 *   const a = yield* Result.succeed(1)
 *   const b = yield* Result.succeed(2)
 *   return a + b
 * })
 *
 * console.log(result)
 * // Output: { _tag: "Success", success: 3, ... }
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
const exportName = "gen";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Generator-based syntax for composing `Result` values sequentially.";
const sourceExample =
  'import { Result } from "effect"\n\nconst result = Result.gen(function*() {\n  const a = yield* Result.succeed(1)\n  const b = yield* Result.succeed(2)\n  return a + b\n})\n\nconsole.log(result)\n// Output: { _tag: "Success", success: 3, ... }';
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
