/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: map
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.961Z
 *
 * Overview:
 * Transforms all values in the TxHashMap using the provided function, preserving keys.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   // Create a user profile map
 *   const profiles = yield* TxHashMap.make(
 *     ["alice", { name: "Alice", age: 30, active: true }],
 *     ["bob", { name: "Bob", age: 25, active: false }],
 *     ["charlie", { name: "Charlie", age: 35, active: true }]
 *   )
 * 
 *   // Transform to extract just names with greeting
 *   const greetings = yield* TxHashMap.map(
 *     profiles,
 *     (profile, userId) => `Hello, ${profile.name}! (User: ${userId})`
 *   )
 * 
 *   // Check the transformed values
 *   const aliceGreeting = yield* TxHashMap.get(greetings, "alice")
 *   console.log(aliceGreeting) // Option.some("Hello, Alice! (User: alice)")
 * 
 *   // Data-last usage with pipe
 *   const ages = yield* profiles.pipe(
 *     TxHashMap.map((profile) => profile.age)
 *   )
 * 
 *   const aliceAge = yield* TxHashMap.get(ages, "alice")
 *   console.log(aliceAge) // Option.some(30)
 * 
 *   // Original map is unchanged
 *   const originalAlice = yield* TxHashMap.get(profiles, "alice")
 *   console.log(originalAlice) // Option.some({ name: "Alice", age: 30, active: true })
 * })
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
import * as TxHashMapModule from "effect/TxHashMap";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "map";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Transforms all values in the TxHashMap using the provided function, preserving keys.";
const sourceExample = "import { Effect, TxHashMap } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  // Create a user profile map\n  const profiles = yield* TxHashMap.make(\n    [\"alice\", { name: \"Alice\", age: 30, active: true }],\n    [\"bob\", { name: \"Bob\", age: 25, active: false }],\n    [\"charlie\", { name: \"Charlie\", age: 35, active: true }]\n  )\n\n  // Transform to extract just names with greeting\n  const greetings = yield* TxHashMap.map(\n    profiles,\n    (profile, userId) => `Hello, ${profile.name}! (User: ${userId})`\n  )\n\n  // Check the transformed values\n  const aliceGreeting = yield* TxHashMap.get(greetings, \"alice\")\n  console.log(aliceGreeting) // Option.some(\"Hello, Alice! (User: alice)\")\n\n  // Data-last usage with pipe\n  const ages = yield* profiles.pipe(\n    TxHashMap.map((profile) => profile.age)\n  )\n\n  const aliceAge = yield* TxHashMap.get(ages, \"alice\")\n  console.log(aliceAge) // Option.some(30)\n\n  // Original map is unchanged\n  const originalAlice = yield* TxHashMap.get(profiles, \"alice\")\n  console.log(originalAlice) // Option.some({ name: \"Alice\", age: 30, active: true })\n})";
const moduleRecord = TxHashMapModule as Record<string, unknown>;

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
