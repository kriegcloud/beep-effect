/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: repeatOrElse
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.392Z
 *
 * Overview:
 * Repeats an effect with a schedule, handling failures using a custom handler.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 * import * as Option from "effect/Option"
 * 
 * let attempt = 0
 * const task = Effect.gen(function*() {
 *   attempt++
 *   if (attempt <= 2) {
 *     yield* Console.log(`Attempt ${attempt} failed`)
 *     yield* Effect.fail(`Error ${attempt}`)
 *   }
 *   yield* Console.log(`Attempt ${attempt} succeeded`)
 *   return "success"
 * })
 * 
 * const program = Effect.repeatOrElse(
 *   task,
 *   Schedule.recurs(3),
 *   (error, attempts) =>
 *     Console.log(
 *       `Final failure: ${error}, after ${
 *         Option.getOrElse(attempts, () => 0)
 *       } attempts`
 *     ).pipe(Effect.map(() => 0))
 * )
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
const exportName = "repeatOrElse";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Repeats an effect with a schedule, handling failures using a custom handler.";
const sourceExample = "import { Console, Effect, Schedule } from \"effect\"\nimport * as Option from \"effect/Option\"\n\nlet attempt = 0\nconst task = Effect.gen(function*() {\n  attempt++\n  if (attempt <= 2) {\n    yield* Console.log(`Attempt ${attempt} failed`)\n    yield* Effect.fail(`Error ${attempt}`)\n  }\n  yield* Console.log(`Attempt ${attempt} succeeded`)\n  return \"success\"\n})\n\nconst program = Effect.repeatOrElse(\n  task,\n  Schedule.recurs(3),\n  (error, attempts) =>\n    Console.log(\n      `Final failure: ${error}, after ${\n        Option.getOrElse(attempts, () => 0)\n      } attempts`\n    ).pipe(Effect.map(() => 0))\n)";
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
