/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: servicesWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.394Z
 *
 * Overview:
 * Transforms the current service map using the provided function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Option, ServiceMap } from "effect"
 *
 * const Logger = ServiceMap.Service<{
 *   log: (msg: string) => void
 * }>("Logger")
 * const Cache = ServiceMap.Service<{
 *   get: (key: string) => string | null
 * }>("Cache")
 *
 * const program = Effect.servicesWith((services) => {
 *   const cacheOption = ServiceMap.getOption(services, Cache)
 *   const hasCache = Option.isSome(cacheOption)
 *
 *   if (hasCache) {
 *     return Effect.gen(function*() {
 *       const cache = yield* Effect.service(Cache)
 *       yield* Console.log("Using cached data")
 *       return cache.get("user:123") || "default"
 *     })
 *   } else {
 *     return Effect.gen(function*() {
 *       yield* Console.log("No cache available, using fallback")
 *       return "fallback data"
 *     })
 *   }
 * })
 *
 * const withCache = Effect.provideService(program, Cache, {
 *   get: () => "cached_value"
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
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "servicesWith";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Transforms the current service map using the provided function.";
const sourceExample =
  'import { Console, Effect, Option, ServiceMap } from "effect"\n\nconst Logger = ServiceMap.Service<{\n  log: (msg: string) => void\n}>("Logger")\nconst Cache = ServiceMap.Service<{\n  get: (key: string) => string | null\n}>("Cache")\n\nconst program = Effect.servicesWith((services) => {\n  const cacheOption = ServiceMap.getOption(services, Cache)\n  const hasCache = Option.isSome(cacheOption)\n\n  if (hasCache) {\n    return Effect.gen(function*() {\n      const cache = yield* Effect.service(Cache)\n      yield* Console.log("Using cached data")\n      return cache.get("user:123") || "default"\n    })\n  } else {\n    return Effect.gen(function*() {\n      yield* Console.log("No cache available, using fallback")\n      return "fallback data"\n    })\n  }\n})\n\nconst withCache = Effect.provideService(program, Cache, {\n  get: () => "cached_value"\n})';
const moduleRecord = EffectModule as Record<string, unknown>;

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
