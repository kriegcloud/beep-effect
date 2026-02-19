/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Data
 * Export: TaggedClass
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Data.ts
 * Generated: 2026-02-19T04:14:11.232Z
 *
 * Overview:
 * Provides a Tagged constructor for a Case Class.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Equal } from "effect"
 * import * as assert from "node:assert"
 *
 * class Person extends Data.TaggedClass("Person")<{ readonly name: string }> {}
 *
 * // Creating instances of Person
 * const mike1 = new Person({ name: "Mike" })
 * const mike2 = new Person({ name: "Mike" })
 * const john = new Person({ name: "John" })
 *
 * // Checking equality
 * assert.deepStrictEqual(Equal.equals(mike1, mike2), true)
 * assert.deepStrictEqual(Equal.equals(mike1, john), false)
 *
 * assert.deepStrictEqual(mike1._tag, "Person")
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
import * as DataModule from "effect/Data";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "TaggedClass";
const exportKind = "const";
const moduleImportPath = "effect/Data";
const sourceSummary = "Provides a Tagged constructor for a Case Class.";
const sourceExample =
  'import { Data, Equal } from "effect"\nimport * as assert from "node:assert"\n\nclass Person extends Data.TaggedClass("Person")<{ readonly name: string }> {}\n\n// Creating instances of Person\nconst mike1 = new Person({ name: "Mike" })\nconst mike2 = new Person({ name: "Mike" })\nconst john = new Person({ name: "John" })\n\n// Checking equality\nassert.deepStrictEqual(Equal.equals(mike1, mike2), true)\nassert.deepStrictEqual(Equal.equals(mike1, john), false)\n\nassert.deepStrictEqual(mike1._tag, "Person")';
const moduleRecord = DataModule as Record<string, unknown>;

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
