/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: logInfo
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.911Z
 *
 * Overview:
 * Logs one or more messages at the INFO level.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.logInfo("Application starting up")
 *   yield* Effect.logInfo("Config loaded:", "production", "Port:", 3000)
 *
 *   // Useful for general information
 *   const version = "1.2.3"
 *   yield* Effect.logInfo("Application version:", version)
 * })
 *
 * Effect.runPromise(program)
 * // Output:
 * // timestamp=2023-... level=INFO message="Application starting up"
 * // timestamp=2023-... level=INFO message="Config loaded: production Port: 3000"
 * // timestamp=2023-... level=INFO message="Application version: 1.2.3"
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "logInfo";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Logs one or more messages at the INFO level.";
const sourceExample =
  'import { Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  yield* Effect.logInfo("Application starting up")\n  yield* Effect.logInfo("Config loaded:", "production", "Port:", 3000)\n\n  // Useful for general information\n  const version = "1.2.3"\n  yield* Effect.logInfo("Application version:", version)\n})\n\nEffect.runPromise(program)\n// Output:\n// timestamp=2023-... level=INFO message="Application starting up"\n// timestamp=2023-... level=INFO message="Config loaded: production Port: 3000"\n// timestamp=2023-... level=INFO message="Application version: 1.2.3"';
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
