/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: groupBy
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:14:09.703Z
 *
 * Overview:
 * Groups elements into a record by a key-returning function. Each key maps to a `NonEmptyArray` of elements that produced that key.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 *
 * const people = [
 *   { name: "Alice", group: "A" },
 *   { name: "Bob", group: "B" },
 *   { name: "Charlie", group: "A" }
 * ]
 *
 * const result = Array.groupBy(people, (person) => person.group)
 * console.log(result)
 * // { A: [{ name: "Alice", group: "A" }, { name: "Charlie", group: "A" }], B: [{ name: "Bob", group: "B" }] }
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
import * as ArrayModule from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "groupBy";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary =
  "Groups elements into a record by a key-returning function. Each key maps to a `NonEmptyArray` of elements that produced that key.";
const sourceExample =
  'import { Array } from "effect"\n\nconst people = [\n  { name: "Alice", group: "A" },\n  { name: "Bob", group: "B" },\n  { name: "Charlie", group: "A" }\n]\n\nconst result = Array.groupBy(people, (person) => person.group)\nconsole.log(result)\n// { A: [{ name: "Alice", group: "A" }, { name: "Charlie", group: "A" }], B: [{ name: "Bob", group: "B" }] }';
const moduleRecord = ArrayModule as Record<string, unknown>;

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
