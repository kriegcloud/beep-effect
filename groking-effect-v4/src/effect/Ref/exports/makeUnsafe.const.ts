/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Ref
 * Export: makeUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Ref.ts
 * Generated: 2026-02-19T04:50:38.751Z
 *
 * Overview:
 * Creates a new Ref with the specified initial value (unsafe version).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Ref } from "effect"
 *
 * // Create a ref directly without Effect
 * const counter = Ref.makeUnsafe(0)
 *
 * // Get the current value
 * const value = Ref.getUnsafe(counter)
 * console.log(value) // 0
 *
 * // Note: This is unsafe and should be used carefully
 * // Prefer Ref.make for Effect-wrapped creation
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
import * as RefModule from "effect/Ref";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Ref";
const sourceSummary = "Creates a new Ref with the specified initial value (unsafe version).";
const sourceExample =
  'import { Ref } from "effect"\n\n// Create a ref directly without Effect\nconst counter = Ref.makeUnsafe(0)\n\n// Get the current value\nconst value = Ref.getUnsafe(counter)\nconsole.log(value) // 0\n\n// Note: This is unsafe and should be used carefully\n// Prefer Ref.make for Effect-wrapped creation';
const moduleRecord = RefModule as Record<string, unknown>;

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
