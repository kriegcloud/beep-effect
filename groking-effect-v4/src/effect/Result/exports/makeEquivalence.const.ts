/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: makeEquivalence
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:14:16.772Z
 *
 * Overview:
 * Creates an `Equivalence` for comparing two `Result` values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equivalence, Result } from "effect"
 *
 * const eq = Result.makeEquivalence(
 *   Equivalence.strictEqual<number>(),
 *   Equivalence.strictEqual<string>()
 * )
 *
 * console.log(eq(Result.succeed(1), Result.succeed(1)))
 * // Output: true
 *
 * console.log(eq(Result.succeed(1), Result.fail("x")))
 * // Output: false
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
const exportName = "makeEquivalence";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Creates an `Equivalence` for comparing two `Result` values.";
const sourceExample =
  'import { Equivalence, Result } from "effect"\n\nconst eq = Result.makeEquivalence(\n  Equivalence.strictEqual<number>(),\n  Equivalence.strictEqual<string>()\n)\n\nconsole.log(eq(Result.succeed(1), Result.succeed(1)))\n// Output: true\n\nconsole.log(eq(Result.succeed(1), Result.fail("x")))\n// Output: false';
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
