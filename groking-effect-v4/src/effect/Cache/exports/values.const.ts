/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cache
 * Export: values
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cache.ts
 * Generated: 2026-02-19T04:14:10.126Z
 *
 * Overview:
 * Retrieves all successfully cached values from the cache, excluding failed lookups and expired entries.
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
 *   // Add some values to the cache
 *   yield* Cache.get(cache, "a")
 *   yield* Cache.get(cache, "ab")
 *   yield* Cache.get(cache, "abc")
 *
 *   // Retrieve all cached values
 *   const values = yield* Cache.values(cache)
 *   const valuesArray = Array.from(values).sort()
 *
 *   console.log(valuesArray) // [1, 2, 3]
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
const exportName = "values";
const exportKind = "const";
const moduleImportPath = "effect/Cache";
const sourceSummary =
  "Retrieves all successfully cached values from the cache, excluding failed lookups and expired entries.";
const sourceExample =
  'import { Cache, Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  const cache = yield* Cache.make({\n    capacity: 10,\n    lookup: (key: string) => Effect.succeed(key.length)\n  })\n\n  // Add some values to the cache\n  yield* Cache.get(cache, "a")\n  yield* Cache.get(cache, "ab")\n  yield* Cache.get(cache, "abc")\n\n  // Retrieve all cached values\n  const values = yield* Cache.values(cache)\n  const valuesArray = Array.from(values).sort()\n\n  console.log(valuesArray) // [1, 2, 3]\n})';
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
