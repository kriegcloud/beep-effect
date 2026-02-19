/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: empty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.960Z
 *
 * Overview:
 * Creates an empty TxHashMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   // Create an empty transactional hash map
 *   const emptyMap = yield* TxHashMap.empty<string, number>()
 * 
 *   // Verify it's empty
 *   const isEmpty = yield* TxHashMap.isEmpty(emptyMap)
 *   console.log(isEmpty) // true
 * 
 *   const size = yield* TxHashMap.size(emptyMap)
 *   console.log(size) // 0
 * 
 *   // Start adding elements
 *   yield* TxHashMap.set(emptyMap, "first", 1)
 *   const newSize = yield* TxHashMap.size(emptyMap)
 *   console.log(newSize) // 1
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
const exportName = "empty";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Creates an empty TxHashMap.";
const sourceExample = "import { Effect, TxHashMap } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  // Create an empty transactional hash map\n  const emptyMap = yield* TxHashMap.empty<string, number>()\n\n  // Verify it's empty\n  const isEmpty = yield* TxHashMap.isEmpty(emptyMap)\n  console.log(isEmpty) // true\n\n  const size = yield* TxHashMap.size(emptyMap)\n  console.log(size) // 0\n\n  // Start adding elements\n  yield* TxHashMap.set(emptyMap, \"first\", 1)\n  const newSize = yield* TxHashMap.size(emptyMap)\n  console.log(newSize) // 1\n})";
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
