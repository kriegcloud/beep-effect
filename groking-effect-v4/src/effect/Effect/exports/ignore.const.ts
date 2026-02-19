/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: ignore
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.389Z
 *
 * Overview:
 * Discards both the success and failure values of an effect.
 *
 * Source JSDoc Example:
 * ```ts
 * // Title: Using Effect.ignore to Discard Values
 * import { Effect } from "effect"
 * 
 * //      ┌─── Effect<number, string, never>
 * //      ▼
 * const task = Effect.fail("Uh oh!").pipe(Effect.as(5))
 * 
 * //      ┌─── Effect<void, never, never>
 * //      ▼
 * const program = task.pipe(Effect.ignore)
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
const exportName = "ignore";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Discards both the success and failure values of an effect.";
const sourceExample = "// Title: Using Effect.ignore to Discard Values\nimport { Effect } from \"effect\"\n\n//      ┌─── Effect<number, string, never>\n//      ▼\nconst task = Effect.fail(\"Uh oh!\").pipe(Effect.as(5))\n\n//      ┌─── Effect<void, never, never>\n//      ▼\nconst program = task.pipe(Effect.ignore)";
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
