/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Struct
 * Export: evolveKeys
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Struct.ts
 * Generated: 2026-02-19T04:14:21.491Z
 *
 * Overview:
 * Selectively transforms keys of a struct using per-key functions. Keys without a corresponding function are copied unchanged.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Struct } from "effect"
 *
 * const result = pipe(
 *   { name: "Alice", age: 30 },
 *   Struct.evolveKeys({
 *     name: (k) => k.toUpperCase()
 *   })
 * )
 * console.log(result) // { NAME: "Alice", age: 30 }
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as StructModule from "effect/Struct";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "evolveKeys";
const exportKind = "const";
const moduleImportPath = "effect/Struct";
const sourceSummary =
  "Selectively transforms keys of a struct using per-key functions. Keys without a corresponding function are copied unchanged.";
const sourceExample =
  'import { pipe, Struct } from "effect"\n\nconst result = pipe(\n  { name: "Alice", age: 30 },\n  Struct.evolveKeys({\n    name: (k) => k.toUpperCase()\n  })\n)\nconsole.log(result) // { NAME: "Alice", age: 30 }';
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
