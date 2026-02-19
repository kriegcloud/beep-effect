/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxHashMap
 * Export: fromIterable
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxHashMap.ts
 * Generated: 2026-02-19T04:14:22.961Z
 *
 * Overview:
 * Creates a TxHashMap from an iterable of key-value pairs.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxHashMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create from various iterable sources
 *   const configEntries = [
 *     ["database.host", "localhost"],
 *     ["database.port", "5432"],
 *     ["cache.enabled", "true"],
 *     ["logging.level", "info"]
 *   ] as const
 *
 *   const configMap = yield* TxHashMap.fromIterable(configEntries)
 *
 *   // Verify the configuration was loaded
 *   const size = yield* TxHashMap.size(configMap)
 *   console.log(size) // 4
 *
 *   const dbHost = yield* TxHashMap.get(configMap, "database.host")
 *   console.log(dbHost) // Option.some("localhost")
 *
 *   // Can also create from Map, Set of tuples, etc.
 *   const jsMap = new Map([["key1", "value1"], ["key2", "value2"]])
 *   const txMapFromJs = yield* TxHashMap.fromIterable(jsMap)
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TxHashMapModule from "effect/TxHashMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromIterable";
const exportKind = "const";
const moduleImportPath = "effect/TxHashMap";
const sourceSummary = "Creates a TxHashMap from an iterable of key-value pairs.";
const sourceExample =
  'import { Effect, TxHashMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create from various iterable sources\n  const configEntries = [\n    ["database.host", "localhost"],\n    ["database.port", "5432"],\n    ["cache.enabled", "true"],\n    ["logging.level", "info"]\n  ] as const\n\n  const configMap = yield* TxHashMap.fromIterable(configEntries)\n\n  // Verify the configuration was loaded\n  const size = yield* TxHashMap.size(configMap)\n  console.log(size) // 4\n\n  const dbHost = yield* TxHashMap.get(configMap, "database.host")\n  console.log(dbHost) // Option.some("localhost")\n\n  // Can also create from Map, Set of tuples, etc.\n  const jsMap = new Map([["key1", "value1"], ["key2", "value2"]])\n  const txMapFromJs = yield* TxHashMap.fromIterable(jsMap)\n})';
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
