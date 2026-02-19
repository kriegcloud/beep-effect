/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cache
 * Export: makeWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cache.ts
 * Generated: 2026-02-19T04:14:10.125Z
 *
 * Overview:
 * Creates a cache with dynamic time-to-live based on the result and key.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cache, Effect, Exit } from "effect"
 * 
 * // Cache with different TTL for success vs failure
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.makeWith<string, number, string>({
 *     capacity: 100,
 *     lookup: (key) =>
 *       key === "fail"
 *         ? Effect.fail("error")
 *         : Effect.succeed(key.length),
 *     timeToLive: (exit, key) => {
 *       if (Exit.isFailure(exit)) return "1 minute" // Short TTL for errors
 *       return key.startsWith("temp") ? "5 minutes" : "1 hour"
 *     }
 *   })
 * 
 *   // Get values with different TTL policies
 *   const result1 = yield* Cache.get(cache, "hello")
 *   const result2 = yield* Cache.get(cache, "temp_data")
 *   console.log({ result1, result2 }) // { result1: 5, result2: 9 }
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
const exportName = "makeWith";
const exportKind = "const";
const moduleImportPath = "effect/Cache";
const sourceSummary = "Creates a cache with dynamic time-to-live based on the result and key.";
const sourceExample = "import { Cache, Effect, Exit } from \"effect\"\n\n// Cache with different TTL for success vs failure\nconst program = Effect.gen(function*() {\n  const cache = yield* Cache.makeWith<string, number, string>({\n    capacity: 100,\n    lookup: (key) =>\n      key === \"fail\"\n        ? Effect.fail(\"error\")\n        : Effect.succeed(key.length),\n    timeToLive: (exit, key) => {\n      if (Exit.isFailure(exit)) return \"1 minute\" // Short TTL for errors\n      return key.startsWith(\"temp\") ? \"5 minutes\" : \"1 hour\"\n    }\n  })\n\n  // Get values with different TTL policies\n  const result1 = yield* Cache.get(cache, \"hello\")\n  const result2 = yield* Cache.get(cache, \"temp_data\")\n  console.log({ result1, result2 }) // { result1: 5, result2: 9 }\n})";
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
