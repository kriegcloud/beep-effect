/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cache
 * Export: invalidateAll
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cache.ts
 * Generated: 2026-02-19T04:50:33.098Z
 *
 * Overview:
 * Invalidates all entries in the cache.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * // Clear all cached entries at once
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 10,
 *     lookup: (key: string) => Effect.succeed(key.length)
 *   })
 *
 *   // Populate cache with multiple entries
 *   yield* Cache.get(cache, "apple")
 *   yield* Cache.get(cache, "banana")
 *   yield* Cache.get(cache, "cherry")
 *
 *   console.log(yield* Cache.size(cache)) // 3
 *   console.log(yield* Cache.has(cache, "apple")) // true
 *
 *   // Clear all entries
 *   yield* Cache.invalidateAll(cache)
 *
 *   // Verify cache is empty
 *   console.log(yield* Cache.size(cache)) // 0
 *   console.log(yield* Cache.has(cache, "apple")) // false
 *   console.log(yield* Cache.has(cache, "banana")) // false
 *   console.log(yield* Cache.has(cache, "cherry")) // false
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
const exportName = "invalidateAll";
const exportKind = "const";
const moduleImportPath = "effect/Cache";
const sourceSummary = "Invalidates all entries in the cache.";
const sourceExample =
  'import { Cache, Effect } from "effect"\n\n// Clear all cached entries at once\nconst program = Effect.gen(function*() {\n  const cache = yield* Cache.make({\n    capacity: 10,\n    lookup: (key: string) => Effect.succeed(key.length)\n  })\n\n  // Populate cache with multiple entries\n  yield* Cache.get(cache, "apple")\n  yield* Cache.get(cache, "banana")\n  yield* Cache.get(cache, "cherry")\n\n  console.log(yield* Cache.size(cache)) // 3\n  console.log(yield* Cache.has(cache, "apple")) // true\n\n  // Clear all entries\n  yield* Cache.invalidateAll(cache)\n\n  // Verify cache is empty\n  console.log(yield* Cache.size(cache)) // 0\n  console.log(yield* Cache.has(cache, "apple")) // false\n  console.log(yield* Cache.has(cache, "banana")) // false\n  console.log(yield* Cache.has(cache, "cherry")) // false\n})';
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
