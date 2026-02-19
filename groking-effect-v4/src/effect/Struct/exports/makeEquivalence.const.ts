/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Struct
 * Export: makeEquivalence
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Struct.ts
 * Generated: 2026-02-19T04:14:21.491Z
 *
 * Overview:
 * Creates an `Equivalence` for a struct by providing an `Equivalence` for each property. Two structs are equivalent when all their corresponding properties are equivalent.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equivalence, Struct } from "effect"
 *
 * const PersonEquivalence = Struct.makeEquivalence({
 *   name: Equivalence.strictEqual<string>(),
 *   age: Equivalence.strictEqual<number>()
 * })
 *
 * console.log(PersonEquivalence({ name: "Alice", age: 30 }, { name: "Alice", age: 30 }))
 * // true
 * console.log(PersonEquivalence({ name: "Alice", age: 30 }, { name: "Bob", age: 30 }))
 * // false
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
const exportName = "makeEquivalence";
const exportKind = "const";
const moduleImportPath = "effect/Struct";
const sourceSummary =
  "Creates an `Equivalence` for a struct by providing an `Equivalence` for each property. Two structs are equivalent when all their corresponding properties are equivalent.";
const sourceExample =
  'import { Equivalence, Struct } from "effect"\n\nconst PersonEquivalence = Struct.makeEquivalence({\n  name: Equivalence.strictEqual<string>(),\n  age: Equivalence.strictEqual<number>()\n})\n\nconsole.log(PersonEquivalence({ name: "Alice", age: 30 }, { name: "Alice", age: 30 }))\n// true\nconsole.log(PersonEquivalence({ name: "Alice", age: 30 }, { name: "Bob", age: 30 }))\n// false';
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
