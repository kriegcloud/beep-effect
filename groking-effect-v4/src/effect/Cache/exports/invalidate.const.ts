/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cache
 * Export: invalidate
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cache.ts
 * Generated: 2026-02-19T04:50:33.088Z
 *
 * Overview:
 * Invalidates the entry associated with the specified key in the cache.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 10,
 *     lookup: (key: string) => Effect.succeed(key.length)
 *   })
 *
 *   // Add a value to the cache
 *   yield* Cache.get(cache, "hello")
 *   console.log(yield* Cache.has(cache, "hello")) // true
 *
 *   // Invalidate the entry
 *   yield* Cache.invalidate(cache, "hello")
 *   console.log(yield* Cache.has(cache, "hello")) // false
 *
 *   // Invalidating non-existent keys doesn't error
 *   yield* Cache.invalidate(cache, "nonexistent")
 *
 *   // Get after invalidation will invoke lookup again
 *   let lookupCount = 0
 *   const cache2 = yield* Cache.make({
 *     capacity: 10,
 *     lookup: (key: string) =>
 *       Effect.sync(() => {
 *         lookupCount++
 *         return key.length
 *       })
 *   })
 *
 *   yield* Cache.get(cache2, "test") // lookupCount = 1
 *   yield* Cache.invalidate(cache2, "test")
 *   yield* Cache.get(cache2, "test") // lookupCount = 2 (lookup called again)
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
import * as CacheModule from "effect/Cache";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "invalidate";
const exportKind = "const";
const moduleImportPath = "effect/Cache";
const sourceSummary = "Invalidates the entry associated with the specified key in the cache.";
const sourceExample =
  'import { Cache, Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  const cache = yield* Cache.make({\n    capacity: 10,\n    lookup: (key: string) => Effect.succeed(key.length)\n  })\n\n  // Add a value to the cache\n  yield* Cache.get(cache, "hello")\n  console.log(yield* Cache.has(cache, "hello")) // true\n\n  // Invalidate the entry\n  yield* Cache.invalidate(cache, "hello")\n  console.log(yield* Cache.has(cache, "hello")) // false\n\n  // Invalidating non-existent keys doesn\'t error\n  yield* Cache.invalidate(cache, "nonexistent")\n\n  // Get after invalidation will invoke lookup again\n  let lookupCount = 0\n  const cache2 = yield* Cache.make({\n    capacity: 10,\n    lookup: (key: string) =>\n      Effect.sync(() => {\n        lookupCount++\n        return key.length\n      })\n  })\n\n  yield* Cache.get(cache2, "test") // lookupCount = 1\n  yield* Cache.invalidate(cache2, "test")\n  yield* Cache.get(cache2, "test") // lookupCount = 2 (lookup called again)\n})';
const moduleRecord = CacheModule as Record<string, unknown>;

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
