/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cache
 * Export: size
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cache.ts
 * Generated: 2026-02-19T04:50:33.098Z
 *
 * Overview:
 * Retrieves the approximate number of entries in the cache.
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
 *   // Empty cache has size 0
 *   const emptySize = yield* Cache.size(cache)
 *   console.log(emptySize) // 0
 *
 *   // Add entries and check size
 *   yield* Cache.get(cache, "hello")
 *   yield* Cache.get(cache, "world")
 *   const sizeAfterAdding = yield* Cache.size(cache)
 *   console.log(sizeAfterAdding) // 2
 *
 *   // Size decreases after invalidation
 *   yield* Cache.invalidate(cache, "hello")
 *   const sizeAfterInvalidation = yield* Cache.size(cache)
 *   console.log(sizeAfterInvalidation) // 1
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
const exportName = "size";
const exportKind = "const";
const moduleImportPath = "effect/Cache";
const sourceSummary = "Retrieves the approximate number of entries in the cache.";
const sourceExample =
  'import { Cache, Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  const cache = yield* Cache.make({\n    capacity: 10,\n    lookup: (key: string) => Effect.succeed(key.length)\n  })\n\n  // Empty cache has size 0\n  const emptySize = yield* Cache.size(cache)\n  console.log(emptySize) // 0\n\n  // Add entries and check size\n  yield* Cache.get(cache, "hello")\n  yield* Cache.get(cache, "world")\n  const sizeAfterAdding = yield* Cache.size(cache)\n  console.log(sizeAfterAdding) // 2\n\n  // Size decreases after invalidation\n  yield* Cache.invalidate(cache, "hello")\n  const sizeAfterInvalidation = yield* Cache.size(cache)\n  console.log(sizeAfterInvalidation) // 1\n})';
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
