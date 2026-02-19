/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: onExit
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.391Z
 *
 * Overview:
 * Ensures that a cleanup functions runs, whether this effect succeeds, fails, or is interrupted.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Exit } from "effect"
 * 
 * const task = Effect.succeed(42)
 * 
 * const program = Effect.onExit(task, (exit) =>
 *   Console.log(
 *     Exit.isSuccess(exit)
 *       ? `Task succeeded with: ${exit.value}`
 *       : `Task failed: ${Exit.isFailure(exit) ? exit.cause : "interrupted"}`
 *   ))
 * 
 * Effect.runPromise(program).then(console.log)
 * // Output:
 * // Task succeeded with: 42
 * // 42
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
const exportName = "onExit";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Ensures that a cleanup functions runs, whether this effect succeeds, fails, or is interrupted.";
const sourceExample = "import { Console, Effect, Exit } from \"effect\"\n\nconst task = Effect.succeed(42)\n\nconst program = Effect.onExit(task, (exit) =>\n  Console.log(\n    Exit.isSuccess(exit)\n      ? `Task succeeded with: ${exit.value}`\n      : `Task failed: ${Exit.isFailure(exit) ? exit.cause : \"interrupted\"}`\n  ))\n\nEffect.runPromise(program).then(console.log)\n// Output:\n// Task succeeded with: 42\n// 42";
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
