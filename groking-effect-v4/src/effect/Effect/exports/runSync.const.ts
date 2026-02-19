/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: runSync
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.393Z
 *
 * Overview:
 * Executes an effect synchronously, running it immediately and returning the result.
 *
 * Source JSDoc Example:
 * ```ts
 * // Title: Synchronous Logging
 * import { Effect } from "effect"
 * 
 * const program = Effect.sync(() => {
 *   console.log("Hello, World!")
 *   return 1
 * })
 * 
 * const result = Effect.runSync(program)
 * // Output: Hello, World!
 * 
 * console.log(result)
 * // Output: 1
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
const exportName = "runSync";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Executes an effect synchronously, running it immediately and returning the result.";
const sourceExample = "// Title: Synchronous Logging\nimport { Effect } from \"effect\"\n\nconst program = Effect.sync(() => {\n  console.log(\"Hello, World!\")\n  return 1\n})\n\nconst result = Effect.runSync(program)\n// Output: Hello, World!\n\nconsole.log(result)\n// Output: 1";
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
