/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/HashSet
 * Export: has
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/HashSet.ts
 * Generated: 2026-02-19T04:14:14.176Z
 *
 * Overview:
 * Checks if the HashSet contains the specified value.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as HashSet from "effect/HashSet" // false
 * 
 * // Works with any type that implements Equal
 * import { Equal, Hash } from "effect"
 * 
 * const set = HashSet.make("apple", "banana", "cherry")
 * 
 * console.log(HashSet.has(set, "apple")) // true
 * console.log(HashSet.has(set, "grape"))
 * 
 * class Person implements Equal.Equal {
 *   constructor(readonly name: string) {}
 * 
 *   [Equal.symbol](other: unknown) {
 *     return other instanceof Person && this.name === other.name
 *   }
 * 
 *   [Hash.symbol](): number {
 *     return Hash.string(this.name)
 *   }
 * }
 * 
 * const people = HashSet.make(new Person("Alice"), new Person("Bob"))
 * console.log(HashSet.has(people, new Person("Alice"))) // true
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
import * as HashSetModule from "effect/HashSet";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "has";
const exportKind = "const";
const moduleImportPath = "effect/HashSet";
const sourceSummary = "Checks if the HashSet contains the specified value.";
const sourceExample = "import * as HashSet from \"effect/HashSet\" // false\n\n// Works with any type that implements Equal\nimport { Equal, Hash } from \"effect\"\n\nconst set = HashSet.make(\"apple\", \"banana\", \"cherry\")\n\nconsole.log(HashSet.has(set, \"apple\")) // true\nconsole.log(HashSet.has(set, \"grape\"))\n\nclass Person implements Equal.Equal {\n  constructor(readonly name: string) {}\n\n  [Equal.symbol](other: unknown) {\n    return other instanceof Person && this.name === other.name\n  }\n\n  [Hash.symbol](): number {\n    return Hash.string(this.name)\n  }\n}\n\nconst people = HashSet.make(new Person(\"Alice\"), new Person(\"Bob\"))\nconsole.log(HashSet.has(people, new Person(\"Alice\"))) // true";
const moduleRecord = HashSetModule as Record<string, unknown>;

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
