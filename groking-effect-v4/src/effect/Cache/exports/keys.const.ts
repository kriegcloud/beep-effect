/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cache
 * Export: keys
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cache.ts
 * Generated: 2026-02-19T04:50:33.098Z
 *
 * Overview:
 * Retrieves all active keys from the cache, automatically filtering out expired entries.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * // Basic key enumeration
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 10,
 *     lookup: (key: string) => Effect.succeed(key.length)
 *   })
 *
 *   // Add some entries to the cache
 *   yield* Cache.get(cache, "hello")
 *   yield* Cache.get(cache, "world")
 *   yield* Cache.get(cache, "cache")
 *
 *   // Retrieve all active keys
 *   const keys = yield* Cache.keys(cache)
 *
 *   console.log(Array.from(keys)) // ["hello", "world", "cache"]
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
const exportName = "keys";
const exportKind = "const";
const moduleImportPath = "effect/Cache";
const sourceSummary = "Retrieves all active keys from the cache, automatically filtering out expired entries.";
const sourceExample =
  'import { Cache, Effect } from "effect"\n\n// Basic key enumeration\nconst program = Effect.gen(function*() {\n  const cache = yield* Cache.make({\n    capacity: 10,\n    lookup: (key: string) => Effect.succeed(key.length)\n  })\n\n  // Add some entries to the cache\n  yield* Cache.get(cache, "hello")\n  yield* Cache.get(cache, "world")\n  yield* Cache.get(cache, "cache")\n\n  // Retrieve all active keys\n  const keys = yield* Cache.keys(cache)\n\n  console.log(Array.from(keys)) // ["hello", "world", "cache"]\n})';
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
