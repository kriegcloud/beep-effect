/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Equivalence
 * Export: combine
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Equivalence.ts
 * Generated: 2026-02-19T04:50:36.032Z
 *
 * Overview:
 * Combines two equivalence relations using logical AND.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equivalence } from "effect"
 *
 * interface Person {
 *   name: string
 *   age: number
 * }
 *
 * const nameEquivalence = Equivalence.mapInput(
 *   Equivalence.strictEqual<string>(),
 *   (p: Person) => p.name
 * )
 *
 * const ageEquivalence = Equivalence.mapInput(
 *   Equivalence.strictEqual<number>(),
 *   (p: Person) => p.age
 * )
 *
 * const personEquivalence = Equivalence.combine(nameEquivalence, ageEquivalence)
 *
 * const person1 = { name: "Alice", age: 30 }
 * const person2 = { name: "Alice", age: 30 }
 * const person3 = { name: "Alice", age: 31 }
 *
 * console.log(personEquivalence(person1, person2)) // true
 * console.log(personEquivalence(person1, person3)) // false (different age)
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
import * as EquivalenceModule from "effect/Equivalence";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "combine";
const exportKind = "const";
const moduleImportPath = "effect/Equivalence";
const sourceSummary = "Combines two equivalence relations using logical AND.";
const sourceExample =
  'import { Equivalence } from "effect"\n\ninterface Person {\n  name: string\n  age: number\n}\n\nconst nameEquivalence = Equivalence.mapInput(\n  Equivalence.strictEqual<string>(),\n  (p: Person) => p.name\n)\n\nconst ageEquivalence = Equivalence.mapInput(\n  Equivalence.strictEqual<number>(),\n  (p: Person) => p.age\n)\n\nconst personEquivalence = Equivalence.combine(nameEquivalence, ageEquivalence)\n\nconst person1 = { name: "Alice", age: 30 }\nconst person2 = { name: "Alice", age: 30 }\nconst person3 = { name: "Alice", age: 31 }\n\nconsole.log(personEquivalence(person1, person2)) // true\nconsole.log(personEquivalence(person1, person3)) // false (different age)';
const moduleRecord = EquivalenceModule as Record<string, unknown>;

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
