/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cache
 * Export: Cache
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cache.ts
 * Generated: 2026-02-19T04:14:10.125Z
 *
 * Overview:
 * A cache interface that provides a mutable key-value store with automatic TTL management, capacity limits, and lookup functions for cache misses.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * // Basic cache with string keys and number values
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make<string, number>({
 *     capacity: 100,
 *     lookup: (key: string) => Effect.succeed(key.length)
 *   })
 *
 *   // Cache operations
 *   const value1 = yield* Cache.get(cache, "hello") // 5
 *   const value2 = yield* Cache.get(cache, "world") // 5
 *   const value3 = yield* Cache.get(cache, "hello") // 5 (cached)
 *
 *   return [value1, value2, value3]
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CacheModule from "effect/Cache";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Cache";
const exportKind = "interface";
const moduleImportPath = "effect/Cache";
const sourceSummary =
  "A cache interface that provides a mutable key-value store with automatic TTL management, capacity limits, and lookup functions for cache misses.";
const sourceExample =
  'import { Cache, Effect } from "effect"\n\n// Basic cache with string keys and number values\nconst program = Effect.gen(function*() {\n  const cache = yield* Cache.make<string, number>({\n    capacity: 100,\n    lookup: (key: string) => Effect.succeed(key.length)\n  })\n\n  // Cache operations\n  const value1 = yield* Cache.get(cache, "hello") // 5\n  const value2 = yield* Cache.get(cache, "world") // 5\n  const value3 = yield* Cache.get(cache, "hello") // 5 (cached)\n\n  return [value1, value2, value3]\n})';
const moduleRecord = CacheModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
