/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: succeed
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.394Z
 *
 * Overview:
 * Creates an `Effect` that always succeeds with a given value.
 *
 * Source JSDoc Example:
 * ```ts
 * // Title: Creating a Successful Effect
 * import { Effect } from "effect"
 * 
 * // Creating an effect that represents a successful scenario
 * //
 * //      ┌─── Effect<number, never, never>
 * //      ▼
 * const success = Effect.succeed(42)
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
const exportName = "succeed";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Creates an `Effect` that always succeeds with a given value.";
const sourceExample = "// Title: Creating a Successful Effect\nimport { Effect } from \"effect\"\n\n// Creating an effect that represents a successful scenario\n//\n//      ┌─── Effect<number, never, never>\n//      ▼\nconst success = Effect.succeed(42)";
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
