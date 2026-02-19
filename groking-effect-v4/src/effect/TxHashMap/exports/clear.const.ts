/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: clear
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.960Z
 *
 * Overview:
 * Removes all entries from the TxHashMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const sessionMap = yield* TxHashMap.make(
 *     ["session1", { userId: "alice", expires: "2024-01-01T12:00:00Z" }],
 *     ["session2", { userId: "bob", expires: "2024-01-01T13:00:00Z" }],
 *     ["session3", { userId: "charlie", expires: "2024-01-01T14:00:00Z" }]
 *   )
 * 
 *   // Check initial state
 *   const initialSize = yield* TxHashMap.size(sessionMap)
 *   console.log(initialSize) // 3
 * 
 *   // Clear all sessions (e.g., during maintenance)
 *   yield* TxHashMap.clear(sessionMap)
 * 
 *   // Verify cleared
 *   const finalSize = yield* TxHashMap.size(sessionMap)
 *   console.log(finalSize) // 0
 * 
 *   const isEmpty = yield* TxHashMap.isEmpty(sessionMap)
 *   console.log(isEmpty) // true
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
const exportName = "clear";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Removes all entries from the TxHashMap.";
const sourceExample = "import { Effect, TxHashMap } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const sessionMap = yield* TxHashMap.make(\n    [\"session1\", { userId: \"alice\", expires: \"2024-01-01T12:00:00Z\" }],\n    [\"session2\", { userId: \"bob\", expires: \"2024-01-01T13:00:00Z\" }],\n    [\"session3\", { userId: \"charlie\", expires: \"2024-01-01T14:00:00Z\" }]\n  )\n\n  // Check initial state\n  const initialSize = yield* TxHashMap.size(sessionMap)\n  console.log(initialSize) // 3\n\n  // Clear all sessions (e.g., during maintenance)\n  yield* TxHashMap.clear(sessionMap)\n\n  // Verify cleared\n  const finalSize = yield* TxHashMap.size(sessionMap)\n  console.log(finalSize) // 0\n\n  const isEmpty = yield* TxHashMap.isEmpty(sessionMap)\n  console.log(isEmpty) // true\n})";
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
