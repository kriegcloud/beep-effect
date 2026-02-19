/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: suspend
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.394Z
 *
 * Overview:
 * Delays the creation of an `Effect` until it is actually needed.
 *
 * Source JSDoc Example:
 * ```ts
 * // Title: Lazy Evaluation with Side Effects
 * import { Effect } from "effect"
 * 
 * let i = 0
 * 
 * const bad = Effect.succeed(i++)
 * 
 * const good = Effect.suspend(() => Effect.succeed(i++))
 * 
 * console.log(Effect.runSync(bad)) // Output: 0
 * console.log(Effect.runSync(bad)) // Output: 0
 * 
 * console.log(Effect.runSync(good)) // Output: 1
 * console.log(Effect.runSync(good)) // Output: 2
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
const exportName = "suspend";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Delays the creation of an `Effect` until it is actually needed.";
const sourceExample = "// Title: Lazy Evaluation with Side Effects\nimport { Effect } from \"effect\"\n\nlet i = 0\n\nconst bad = Effect.succeed(i++)\n\nconst good = Effect.suspend(() => Effect.succeed(i++))\n\nconsole.log(Effect.runSync(bad)) // Output: 0\nconsole.log(Effect.runSync(bad)) // Output: 0\n\nconsole.log(Effect.runSync(good)) // Output: 1\nconsole.log(Effect.runSync(good)) // Output: 2";
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
