/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cache
 * Export: refresh
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cache.ts
 * Generated: 2026-02-19T04:14:10.126Z
 *
 * Overview:
 * Forces a refresh of the value associated with the specified key in the cache.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * // Force refresh of existing cached values
 * const program = Effect.gen(function*() {
 *   let counter = 0
 *   const cache = yield* Cache.make({
 *     capacity: 10,
 *     lookup: (key: string) => Effect.sync(() => `${key}-${++counter}`)
 *   })
 *
 *   // Initial cache population
 *   const value1 = yield* Cache.get(cache, "user")
 *   console.log(value1) // "user-1"
 *
 *   // Get from cache (no lookup)
 *   const value2 = yield* Cache.get(cache, "user")
 *   console.log(value2) // "user-1" (same value)
 *
 *   // Force refresh - always calls lookup
 *   const refreshed = yield* Cache.refresh(cache, "user")
 *   console.log(refreshed) // "user-2" (new value)
 *
 *   // Subsequent gets return refreshed value
 *   const value3 = yield* Cache.get(cache, "user")
 *   console.log(value3) // "user-2"
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
const exportName = "refresh";
const exportKind = "const";
const moduleImportPath = "effect/Cache";
const sourceSummary = "Forces a refresh of the value associated with the specified key in the cache.";
const sourceExample =
  'import { Cache, Effect } from "effect"\n\n// Force refresh of existing cached values\nconst program = Effect.gen(function*() {\n  let counter = 0\n  const cache = yield* Cache.make({\n    capacity: 10,\n    lookup: (key: string) => Effect.sync(() => `${key}-${++counter}`)\n  })\n\n  // Initial cache population\n  const value1 = yield* Cache.get(cache, "user")\n  console.log(value1) // "user-1"\n\n  // Get from cache (no lookup)\n  const value2 = yield* Cache.get(cache, "user")\n  console.log(value2) // "user-1" (same value)\n\n  // Force refresh - always calls lookup\n  const refreshed = yield* Cache.refresh(cache, "user")\n  console.log(refreshed) // "user-2" (new value)\n\n  // Subsequent gets return refreshed value\n  const value3 = yield* Cache.get(cache, "user")\n  console.log(value3) // "user-2"\n})';
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
