/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: snapshot
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:50:44.020Z
 *
 * Overview:
 * Returns an immutable snapshot of the current TxHashMap state.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, HashMap, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const liveData = yield* TxHashMap.make(
 *     ["temperature", 22.5],
 *     ["humidity", 45.2],
 *     ["pressure", 1013.25]
 *   )
 *
 *   // Take snapshot for reporting
 *   const snapshot = yield* TxHashMap.snapshot(liveData)
 *
 *   // Continue modifying live data
 *   yield* TxHashMap.set(liveData, "temperature", 23.1)
 *   yield* TxHashMap.set(liveData, "wind_speed", 5.3)
 *
 *   // Snapshot remains unchanged
 *   console.log(HashMap.size(snapshot)) // 3
 *   console.log(HashMap.get(snapshot, "temperature")) // Option.some(22.5)
 *
 *   // Can use regular HashMap operations on snapshot
 *   const tempReading = HashMap.get(snapshot, "temperature")
 *   const humidityReading = HashMap.get(snapshot, "humidity")
 * })
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
import * as TxHashMapModule from "effect/TxHashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "snapshot";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Returns an immutable snapshot of the current TxHashMap state.";
const sourceExample =
  'import { Effect, HashMap, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  const liveData = yield* TxHashMap.make(\n    ["temperature", 22.5],\n    ["humidity", 45.2],\n    ["pressure", 1013.25]\n  )\n\n  // Take snapshot for reporting\n  const snapshot = yield* TxHashMap.snapshot(liveData)\n\n  // Continue modifying live data\n  yield* TxHashMap.set(liveData, "temperature", 23.1)\n  yield* TxHashMap.set(liveData, "wind_speed", 5.3)\n\n  // Snapshot remains unchanged\n  console.log(HashMap.size(snapshot)) // 3\n  console.log(HashMap.get(snapshot, "temperature")) // Option.some(22.5)\n\n  // Can use regular HashMap operations on snapshot\n  const tempReading = HashMap.get(snapshot, "temperature")\n  const humidityReading = HashMap.get(snapshot, "humidity")\n})';
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
