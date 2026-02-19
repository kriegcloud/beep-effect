/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: repeat
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.392Z
 *
 * Overview:
 * Repeats an effect based on a specified schedule or until the first failure.
 *
 * Source JSDoc Example:
 * ```ts
 * // Success Example
 * import { Effect } from "effect"
 * import { Schedule } from "effect"
 * import { Console } from "effect"
 *
 * const action = Console.log("success")
 * const policy = Schedule.addDelay(Schedule.recurs(2), () => Effect.succeed("100 millis"))
 * const program = Effect.repeat(action, policy)
 *
 * // Effect.runPromise(program).then((n) => console.log(`repetitions: ${n}`))
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
const exportName = "repeat";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Repeats an effect based on a specified schedule or until the first failure.";
const sourceExample =
  '// Success Example\nimport { Effect } from "effect"\nimport { Schedule } from "effect"\nimport { Console } from "effect"\n\nconst action = Console.log("success")\nconst policy = Schedule.addDelay(Schedule.recurs(2), () => Effect.succeed("100 millis"))\nconst program = Effect.repeat(action, policy)\n\n// Effect.runPromise(program).then((n) => console.log(`repetitions: ${n}`))';
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
