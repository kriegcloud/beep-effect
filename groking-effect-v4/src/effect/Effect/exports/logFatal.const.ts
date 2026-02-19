/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: logFatal
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.390Z
 *
 * Overview:
 * Logs one or more messages at the FATAL level.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   try {
 *     // Simulate a critical system failure
 *     throw new Error("System memory exhausted")
 *   } catch (error) {
 *     const errorMessage = error instanceof Error ? error.message : String(error)
 *     yield* Effect.logFatal("Critical system failure:", errorMessage)
 *     yield* Effect.logFatal("System shutting down")
 *   }
 * })
 * 
 * Effect.runPromise(program)
 * // Output:
 * // timestamp=2023-... level=FATAL message="Critical system failure: System memory exhausted"
 * // timestamp=2023-... level=FATAL message="System shutting down"
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
const exportName = "logFatal";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Logs one or more messages at the FATAL level.";
const sourceExample = "import { Effect } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  try {\n    // Simulate a critical system failure\n    throw new Error(\"System memory exhausted\")\n  } catch (error) {\n    const errorMessage = error instanceof Error ? error.message : String(error)\n    yield* Effect.logFatal(\"Critical system failure:\", errorMessage)\n    yield* Effect.logFatal(\"System shutting down\")\n  }\n})\n\nEffect.runPromise(program)\n// Output:\n// timestamp=2023-... level=FATAL message=\"Critical system failure: System memory exhausted\"\n// timestamp=2023-... level=FATAL message=\"System shutting down\"";
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
