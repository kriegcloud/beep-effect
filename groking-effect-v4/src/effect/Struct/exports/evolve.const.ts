/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Struct
 * Export: evolve
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Struct.ts
 * Generated: 2026-02-19T04:14:21.491Z
 *
 * Overview:
 * Selectively transforms values of a struct using per-key functions. Keys without a corresponding function are copied unchanged.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Struct } from "effect"
 * 
 * const result = pipe(
 *   { name: "alice", age: 30, active: true },
 *   Struct.evolve({
 *     name: (s) => s.toUpperCase(),
 *     age: (n) => n + 1
 *   })
 * )
 * console.log(result) // { name: "ALICE", age: 31, active: true }
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
import * as StructModule from "effect/Struct";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "evolve";
const exportKind = "const";
const moduleImportPath = "effect/Struct";
const sourceSummary = "Selectively transforms values of a struct using per-key functions. Keys without a corresponding function are copied unchanged.";
const sourceExample = "import { pipe, Struct } from \"effect\"\n\nconst result = pipe(\n  { name: \"alice\", age: 30, active: true },\n  Struct.evolve({\n    name: (s) => s.toUpperCase(),\n    age: (n) => n + 1\n  })\n)\nconsole.log(result) // { name: \"ALICE\", age: 31, active: true }";
const moduleRecord = StructModule as Record<string, unknown>;

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
