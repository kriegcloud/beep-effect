/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: compact
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.960Z
 *
 * Overview:
 * Removes all None values from a TxHashMap containing Option values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Option, TxHashMap } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   // Create a map with optional user data
 *   const userData = yield* TxHashMap.make<
 *     string,
 *     Option.Option<{ age: number; email?: string }>
 *   >(
 *     ["alice", Option.some({ age: 30, email: "alice@example.com" })],
 *     ["bob", Option.none()], // incomplete data
 *     ["charlie", Option.some({ age: 25 })],
 *     ["diana", Option.none()], // missing data
 *     ["eve", Option.some({ age: 28, email: "eve@example.com" })]
 *   )
 * 
 *   // Remove all None values and unwrap Some values
 *   const validUsers = yield* TxHashMap.compact(userData)
 * 
 *   const size = yield* TxHashMap.size(validUsers)
 *   console.log(size) // 3 (alice, charlie, eve)
 * 
 *   const alice = yield* TxHashMap.get(validUsers, "alice")
 *   console.log(alice) // Option.some({ age: 30, email: "alice@example.com" })
 * 
 *   const bob = yield* TxHashMap.get(validUsers, "bob")
 *   console.log(bob) // Option.none() (removed from map)
 * 
 *   // Useful for cleaning up optional data processing results
 *   const userAges = yield* TxHashMap.map(validUsers, (user) => user.age)
 *   const ageEntries = yield* TxHashMap.entries(userAges)
 *   console.log(ageEntries) // [["alice", 30], ["charlie", 25], ["eve", 28]]
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
const exportName = "compact";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Removes all None values from a TxHashMap containing Option values.";
const sourceExample = "import { Effect, Option, TxHashMap } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  // Create a map with optional user data\n  const userData = yield* TxHashMap.make<\n    string,\n    Option.Option<{ age: number; email?: string }>\n  >(\n    [\"alice\", Option.some({ age: 30, email: \"alice@example.com\" })],\n    [\"bob\", Option.none()], // incomplete data\n    [\"charlie\", Option.some({ age: 25 })],\n    [\"diana\", Option.none()], // missing data\n    [\"eve\", Option.some({ age: 28, email: \"eve@example.com\" })]\n  )\n\n  // Remove all None values and unwrap Some values\n  const validUsers = yield* TxHashMap.compact(userData)\n\n  const size = yield* TxHashMap.size(validUsers)\n  console.log(size) // 3 (alice, charlie, eve)\n\n  const alice = yield* TxHashMap.get(validUsers, \"alice\")\n  console.log(alice) // Option.some({ age: 30, email: \"alice@example.com\" })\n\n  const bob = yield* TxHashMap.get(validUsers, \"bob\")\n  console.log(bob) // Option.none() (removed from map)\n\n  // Useful for cleaning up optional data processing results\n  const userAges = yield* TxHashMap.map(validUsers, (user) => user.age)\n  const ageEntries = yield* TxHashMap.entries(userAges)\n  console.log(ageEntries) // [[\"alice\", 30], [\"charlie\", 25], [\"eve\", 28]]\n})";
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
