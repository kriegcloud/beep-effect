/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: logWarning
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.390Z
 *
 * Overview:
 * Logs one or more messages at the WARNING level.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   yield* Effect.logWarning("API rate limit approaching")
 *   yield* Effect.logWarning("Retries remaining:", 2, "Operation:", "fetchData")
 * 
 *   // Useful for non-critical issues
 *   const deprecated = true
 *   if (deprecated) {
 *     yield* Effect.logWarning("Using deprecated API endpoint")
 *   }
 * })
 * 
 * Effect.runPromise(program)
 * // Output:
 * // timestamp=2023-... level=WARN message="API rate limit approaching"
 * // timestamp=2023-... level=WARN message="Retries remaining: 2 Operation: fetchData"
 * // timestamp=2023-... level=WARN message="Using deprecated API endpoint"
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
const exportName = "logWarning";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Logs one or more messages at the WARNING level.";
const sourceExample = "import { Effect } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  yield* Effect.logWarning(\"API rate limit approaching\")\n  yield* Effect.logWarning(\"Retries remaining:\", 2, \"Operation:\", \"fetchData\")\n\n  // Useful for non-critical issues\n  const deprecated = true\n  if (deprecated) {\n    yield* Effect.logWarning(\"Using deprecated API endpoint\")\n  }\n})\n\nEffect.runPromise(program)\n// Output:\n// timestamp=2023-... level=WARN message=\"API rate limit approaching\"\n// timestamp=2023-... level=WARN message=\"Retries remaining: 2 Operation: fetchData\"\n// timestamp=2023-... level=WARN message=\"Using deprecated API endpoint\"";
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
