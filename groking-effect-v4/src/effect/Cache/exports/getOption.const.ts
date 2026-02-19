/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cache
 * Export: getOption
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cache.ts
 * Generated: 2026-02-19T04:50:33.087Z
 *
 * Overview:
 * Retrieves the value associated with the specified key from the cache, returning an `Option` that is `Some` if the key exists and has not expired, or `None` if the key does not exist or has expired.
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
 *   // No value in cache yet - returns None without lookup
 *   const empty = yield* Cache.getOption(cache, "hello")
 *   console.log(empty) // Option.none()
 *
 *   // Populate cache using get
 *   yield* Cache.get(cache, "hello")
 *
 *   // Now getOption returns the cached value
 *   const cached = yield* Cache.getOption(cache, "hello")
 *   console.log(cached) // Option.some(5)
 *
 *   return { empty, cached }
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
const exportName = "getOption";
const exportKind = "const";
const moduleImportPath = "effect/Cache";
const sourceSummary =
  "Retrieves the value associated with the specified key from the cache, returning an `Option` that is `Some` if the key exists and has not expired, or `None` if the key does not e...";
const sourceExample =
  'import { Cache, Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  const cache = yield* Cache.make({\n    capacity: 10,\n    lookup: (key: string) => Effect.succeed(key.length)\n  })\n\n  // No value in cache yet - returns None without lookup\n  const empty = yield* Cache.getOption(cache, "hello")\n  console.log(empty) // Option.none()\n\n  // Populate cache using get\n  yield* Cache.get(cache, "hello")\n\n  // Now getOption returns the cached value\n  const cached = yield* Cache.getOption(cache, "hello")\n  console.log(cached) // Option.some(5)\n\n  return { empty, cached }\n})';
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
