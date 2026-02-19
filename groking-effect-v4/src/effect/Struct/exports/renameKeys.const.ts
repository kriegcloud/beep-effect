/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Struct
 * Export: renameKeys
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Struct.ts
 * Generated: 2026-02-19T04:14:21.492Z
 *
 * Overview:
 * Renames keys in a struct using a static `{ oldKey: newKey }` mapping. Keys not mentioned in the mapping are copied unchanged.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Struct } from "effect"
 *
 * const result = pipe(
 *   { firstName: "Alice", lastName: "Smith", age: 30 },
 *   Struct.renameKeys({ firstName: "first", lastName: "last" })
 * )
 * console.log(result) // { first: "Alice", last: "Smith", age: 30 }
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
const exportName = "renameKeys";
const exportKind = "const";
const moduleImportPath = "effect/Struct";
const sourceSummary =
  "Renames keys in a struct using a static `{ oldKey: newKey }` mapping. Keys not mentioned in the mapping are copied unchanged.";
const sourceExample =
  'import { pipe, Struct } from "effect"\n\nconst result = pipe(\n  { firstName: "Alice", lastName: "Smith", age: 30 },\n  Struct.renameKeys({ firstName: "first", lastName: "last" })\n)\nconsole.log(result) // { first: "Alice", last: "Smith", age: 30 }';
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
