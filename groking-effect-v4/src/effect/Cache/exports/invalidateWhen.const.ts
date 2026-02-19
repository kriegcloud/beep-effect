/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cache
 * Export: invalidateWhen
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cache.ts
 * Generated: 2026-02-19T04:14:10.125Z
 *
 * Overview:
 * Conditionally invalidates the entry associated with the specified key in the cache if the predicate returns true for the cached value.
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
 *   // Add values to the cache
 *   yield* Cache.get(cache, "hello") // value = 5
 *   yield* Cache.get(cache, "hi") // value = 2
 *
 *   // Invalidate when value equals 5
 *   const invalidated1 = yield* Cache.invalidateWhen(
 *     cache,
 *     "hello",
 *     (value) => value === 5
 *   )
 *   console.log(invalidated1) // true
 *   console.log(yield* Cache.has(cache, "hello")) // false
 *
 *   // Don't invalidate when predicate doesn't match
 *   const invalidated2 = yield* Cache.invalidateWhen(
 *     cache,
 *     "hi",
 *     (value) => value === 5
 *   )
 *   console.log(invalidated2) // false
 *   console.log(yield* Cache.has(cache, "hi")) // true (still present)
 *
 *   // Returns false for non-existent keys
 *   const invalidated3 = yield* Cache.invalidateWhen(
 *     cache,
 *     "nonexistent",
 *     () => true
 *   )
 *   console.log(invalidated3) // false
 *
 *   // Returns false for failed cached values
 *   const cacheWithErrors = yield* Cache.make<string, number, string>({
 *     capacity: 10,
 *     lookup: (key: string) =>
 *       key === "fail" ? Effect.fail("error") : Effect.succeed(key.length)
 *   })
 *
 *   yield* Effect.exit(Cache.get(cacheWithErrors, "fail"))
 *   const invalidated4 = yield* Cache.invalidateWhen(
 *     cacheWithErrors,
 *     "fail",
 *     () => true
 *   )
 *   console.log(invalidated4) // false (can't invalidate failed values)
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
import * as CacheModule from "effect/Cache";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "invalidateWhen";
const exportKind = "const";
const moduleImportPath = "effect/Cache";
const sourceSummary =
  "Conditionally invalidates the entry associated with the specified key in the cache if the predicate returns true for the cached value.";
const sourceExample =
  'import { Cache, Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  const cache = yield* Cache.make({\n    capacity: 10,\n    lookup: (key: string) => Effect.succeed(key.length)\n  })\n\n  // Add values to the cache\n  yield* Cache.get(cache, "hello") // value = 5\n  yield* Cache.get(cache, "hi") // value = 2\n\n  // Invalidate when value equals 5\n  const invalidated1 = yield* Cache.invalidateWhen(\n    cache,\n    "hello",\n    (value) => value === 5\n  )\n  console.log(invalidated1) // true\n  console.log(yield* Cache.has(cache, "hello")) // false\n\n  // Don\'t invalidate when predicate doesn\'t match\n  const invalidated2 = yield* Cache.invalidateWhen(\n    cache,\n    "hi",\n    (value) => value === 5\n  )\n  console.log(invalidated2) // false\n  console.log(yield* Cache.has(cache, "hi")) // true (still present)\n\n  // Returns false for non-existent keys\n  const invalidated3 = yield* Cache.invalidateWhen(\n    cache,\n    "nonexistent",\n    () => true\n  )\n  console.log(invalidated3) // false\n\n  // Returns false for failed cached values\n  const cacheWithErrors = yield* Cache.make<string, number, string>({\n    capacity: 10,\n    lookup: (key: string) =>\n      key === "fail" ? Effect.fail("error") : Effect.succeed(key.length)\n  })\n\n  yield* Effect.exit(Cache.get(cacheWithErrors, "fail"))\n  const invalidated4 = yield* Cache.invalidateWhen(\n    cacheWithErrors,\n    "fail",\n    () => true\n  )\n  console.log(invalidated4) // false (can\'t invalidate failed values)\n})';
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
