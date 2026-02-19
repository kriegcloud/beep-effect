/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxRef
 * Export: makeUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxRef.ts
 * Generated: 2026-02-19T04:14:23.331Z
 *
 * Overview:
 * Creates a new `TxRef` with the specified initial value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { TxRef } from "effect"
 * 
 * // Create a TxRef synchronously (unsafe - use make instead in Effect contexts)
 * const counter = TxRef.makeUnsafe(0)
 * const config = TxRef.makeUnsafe({ timeout: 5000, retries: 3 })
 * 
 * // These are now ready to use in transactions
 * console.log(counter.value) // 0
 * console.log(config.value) // { timeout: 5000, retries: 3 }
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
import * as TxRefModule from "effect/TxRef";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/TxRef";
const sourceSummary = "Creates a new `TxRef` with the specified initial value.";
const sourceExample = "import { TxRef } from \"effect\"\n\n// Create a TxRef synchronously (unsafe - use make instead in Effect contexts)\nconst counter = TxRef.makeUnsafe(0)\nconst config = TxRef.makeUnsafe({ timeout: 5000, retries: 3 })\n\n// These are now ready to use in transactions\nconsole.log(counter.value) // 0\nconsole.log(config.value) // { timeout: 5000, retries: 3 }";
const moduleRecord = TxRefModule as Record<string, unknown>;

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
