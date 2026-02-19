/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: orDie
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.391Z
 *
 * Overview:
 * Converts an effect's failure into a fiber termination, removing the error from the effect's type.
 *
 * Source JSDoc Example:
 * ```ts
 * // Title: Propagating an Error as a Defect
 * import { Effect } from "effect"
 *
 * const divide = (a: number, b: number) =>
 *   b === 0
 *     ? Effect.fail(new Error("Cannot divide by zero"))
 *     : Effect.succeed(a / b)
 *
 * //      ┌─── Effect<number, never, never>
 * //      ▼
 * const program = Effect.orDie(divide(1, 0))
 *
 * Effect.runPromise(program).catch(console.error)
 * // Output:
 * // (FiberFailure) Error: Cannot divide by zero
 * //   ...stack trace...
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "orDie";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Converts an effect's failure into a fiber termination, removing the error from the effect's type.";
const sourceExample =
  '// Title: Propagating an Error as a Defect\nimport { Effect } from "effect"\n\nconst divide = (a: number, b: number) =>\n  b === 0\n    ? Effect.fail(new Error("Cannot divide by zero"))\n    : Effect.succeed(a / b)\n\n//      ┌─── Effect<number, never, never>\n//      ▼\nconst program = Effect.orDie(divide(1, 0))\n\nEffect.runPromise(program).catch(console.error)\n// Output:\n// (FiberFailure) Error: Cannot divide by zero\n//   ...stack trace...';
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
