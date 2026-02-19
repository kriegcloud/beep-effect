/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.961Z
 *
 * Overview:
 * Creates a TxHashMap from the provided key-value pairs.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   // Create a user directory
 *   const userMap = yield* TxHashMap.make(
 *     ["alice", { name: "Alice Smith", role: "admin" }],
 *     ["bob", { name: "Bob Johnson", role: "user" }],
 *     ["charlie", { name: "Charlie Brown", role: "user" }]
 *   )
 * 
 *   // Check the initial size
 *   const size = yield* TxHashMap.size(userMap)
 *   console.log(size) // 3
 * 
 *   // Access users
 *   const alice = yield* TxHashMap.get(userMap, "alice")
 *   console.log(alice) // Option.some({ name: "Alice Smith", role: "admin" })
 * 
 *   const nonExistent = yield* TxHashMap.get(userMap, "david")
 *   console.log(nonExistent) // Option.none()
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
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Creates a TxHashMap from the provided key-value pairs.";
const sourceExample = "import { Effect, TxHashMap } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  // Create a user directory\n  const userMap = yield* TxHashMap.make(\n    [\"alice\", { name: \"Alice Smith\", role: \"admin\" }],\n    [\"bob\", { name: \"Bob Johnson\", role: \"user\" }],\n    [\"charlie\", { name: \"Charlie Brown\", role: \"user\" }]\n  )\n\n  // Check the initial size\n  const size = yield* TxHashMap.size(userMap)\n  console.log(size) // 3\n\n  // Access users\n  const alice = yield* TxHashMap.get(userMap, \"alice\")\n  console.log(alice) // Option.some({ name: \"Alice Smith\", role: \"admin\" })\n\n  const nonExistent = yield* TxHashMap.get(userMap, \"david\")\n  console.log(nonExistent) // Option.none()\n})";
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
