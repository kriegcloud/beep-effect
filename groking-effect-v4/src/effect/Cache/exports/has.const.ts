/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cache
 * Export: has
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cache.ts
 * Generated: 2026-02-19T04:14:10.125Z
 *
 * Overview:
 * Checks if the cache contains an entry for the specified key.
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
 *   // Check non-existent key
 *   console.log(yield* Cache.has(cache, "missing")) // false
 * 
 *   // Add entry and check existence
 *   yield* Cache.get(cache, "hello")
 *   console.log(yield* Cache.has(cache, "hello")) // true
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CacheModule from "effect/Cache";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "has";
const exportKind = "const";
const moduleImportPath = "effect/Cache";
const sourceSummary = "Checks if the cache contains an entry for the specified key.";
const sourceExample = "import { Cache, Effect } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const cache = yield* Cache.make({\n    capacity: 100,\n    lookup: (key: string) => Effect.succeed(key.length)\n  })\n\n  // Check non-existent key\n  console.log(yield* Cache.has(cache, \"missing\")) // false\n\n  // Add entry and check existence\n  yield* Cache.get(cache, \"hello\")\n  console.log(yield* Cache.has(cache, \"hello\")) // true\n})";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
