/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cache
 * Export: set
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cache.ts
 * Generated: 2026-02-19T04:50:33.098Z
 *
 * Overview:
 * Sets the value associated with the specified key in the cache. This will overwrite any existing value for that key, skipping the lookup function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 100,
 *     lookup: (key: string) => Effect.succeed(key.length)
 *   })
 *
 *   // Set a value directly without invoking lookup
 *   yield* Cache.set(cache, "hello", 42)
 *   const result = yield* Cache.get(cache, "hello")
 *   console.log(result) // 42 (not 5 from lookup)
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
const exportName = "set";
const exportKind = "const";
const moduleImportPath = "effect/Cache";
const sourceSummary =
  "Sets the value associated with the specified key in the cache. This will overwrite any existing value for that key, skipping the lookup function.";
const sourceExample =
  'import { Cache, Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  const cache = yield* Cache.make({\n    capacity: 100,\n    lookup: (key: string) => Effect.succeed(key.length)\n  })\n\n  // Set a value directly without invoking lookup\n  yield* Cache.set(cache, "hello", 42)\n  const result = yield* Cache.get(cache, "hello")\n  console.log(result) // 42 (not 5 from lookup)\n})';
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
