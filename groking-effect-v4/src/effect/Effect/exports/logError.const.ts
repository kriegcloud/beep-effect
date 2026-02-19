/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: logError
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.390Z
 *
 * Overview:
 * Logs one or more messages at the ERROR level.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   yield* Effect.logError("Database connection failed")
 *   yield* Effect.logError(
 *     "Error code:",
 *     500,
 *     "Message:",
 *     "Internal server error"
 *   )
 * 
 *   // Can be used with error objects
 *   const error = new Error("Something went wrong")
 *   yield* Effect.logError("Caught error:", error.message)
 * })
 * 
 * Effect.runPromise(program)
 * // Output:
 * // timestamp=2023-... level=ERROR message="Database connection failed"
 * // timestamp=2023-... level=ERROR message="Error code: 500 Message: Internal server error"
 * // timestamp=2023-... level=ERROR message="Caught error: Something went wrong"
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
const exportName = "logError";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Logs one or more messages at the ERROR level.";
const sourceExample = "import { Effect } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  yield* Effect.logError(\"Database connection failed\")\n  yield* Effect.logError(\n    \"Error code:\",\n    500,\n    \"Message:\",\n    \"Internal server error\"\n  )\n\n  // Can be used with error objects\n  const error = new Error(\"Something went wrong\")\n  yield* Effect.logError(\"Caught error:\", error.message)\n})\n\nEffect.runPromise(program)\n// Output:\n// timestamp=2023-... level=ERROR message=\"Database connection failed\"\n// timestamp=2023-... level=ERROR message=\"Error code: 500 Message: Internal server error\"\n// timestamp=2023-... level=ERROR message=\"Caught error: Something went wrong\"";
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
