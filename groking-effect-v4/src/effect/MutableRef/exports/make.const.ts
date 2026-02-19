/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/MutableRef
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/MutableRef.ts
 * Generated: 2026-02-19T04:14:15.176Z
 *
 * Overview:
 * Creates a new MutableRef with the specified initial value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { MutableRef } from "effect"
 * 
 * // Create a counter reference
 * const counter = MutableRef.make(0)
 * console.log(MutableRef.get(counter)) // 0
 * 
 * // Create a configuration reference
 * const config = MutableRef.make({ debug: false, timeout: 5000 })
 * console.log(MutableRef.get(config)) // { debug: false, timeout: 5000 }
 * 
 * // Create a string reference
 * const status = MutableRef.make("idle")
 * MutableRef.set(status, "running")
 * console.log(MutableRef.get(status)) // "running"
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
import * as MutableRefModule from "effect/MutableRef";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/MutableRef";
const sourceSummary = "Creates a new MutableRef with the specified initial value.";
const sourceExample = "import { MutableRef } from \"effect\"\n\n// Create a counter reference\nconst counter = MutableRef.make(0)\nconsole.log(MutableRef.get(counter)) // 0\n\n// Create a configuration reference\nconst config = MutableRef.make({ debug: false, timeout: 5000 })\nconsole.log(MutableRef.get(config)) // { debug: false, timeout: 5000 }\n\n// Create a string reference\nconst status = MutableRef.make(\"idle\")\nMutableRef.set(status, \"running\")\nconsole.log(MutableRef.get(status)) // \"running\"";
const moduleRecord = MutableRefModule as Record<string, unknown>;

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
