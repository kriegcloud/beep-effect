/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cache
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cache.ts
 * Generated: 2026-02-19T04:14:10.125Z
 *
 * Overview:
 * Creates a cache with a fixed time-to-live for all entries.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cache, Effect } from "effect"
 * 
 * // Basic cache with string keys
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make<string, number>({
 *     capacity: 100,
 *     lookup: (key) => Effect.succeed(key.length)
 *   })
 * 
 *   const result1 = yield* Cache.get(cache, "hello")
 *   const result2 = yield* Cache.get(cache, "world")
 *   console.log({ result1, result2 }) // { result1: 5, result2: 5 }
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
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/Cache";
const sourceSummary = "Creates a cache with a fixed time-to-live for all entries.";
const sourceExample = "import { Cache, Effect } from \"effect\"\n\n// Basic cache with string keys\nconst program = Effect.gen(function*() {\n  const cache = yield* Cache.make<string, number>({\n    capacity: 100,\n    lookup: (key) => Effect.succeed(key.length)\n  })\n\n  const result1 = yield* Cache.get(cache, \"hello\")\n  const result2 = yield* Cache.get(cache, \"world\")\n  console.log({ result1, result2 }) // { result1: 5, result2: 5 }\n})";
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
