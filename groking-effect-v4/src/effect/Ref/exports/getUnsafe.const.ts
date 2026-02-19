/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Ref
 * Export: getUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Ref.ts
 * Generated: 2026-02-19T04:14:16.480Z
 *
 * Overview:
 * Gets the current value of the Ref synchronously (unsafe version).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Ref } from "effect"
 * 
 * // Create a ref directly
 * const counter = Ref.makeUnsafe(42)
 * 
 * // Get the value synchronously
 * const value = Ref.getUnsafe(counter)
 * console.log(value) // 42
 * 
 * // Note: This is unsafe and should be used carefully
 * // Prefer Ref.get for Effect-wrapped access
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
import * as RefModule from "effect/Ref";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Ref";
const sourceSummary = "Gets the current value of the Ref synchronously (unsafe version).";
const sourceExample = "import { Ref } from \"effect\"\n\n// Create a ref directly\nconst counter = Ref.makeUnsafe(42)\n\n// Get the value synchronously\nconst value = Ref.getUnsafe(counter)\nconsole.log(value) // 42\n\n// Note: This is unsafe and should be used carefully\n// Prefer Ref.get for Effect-wrapped access";
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
