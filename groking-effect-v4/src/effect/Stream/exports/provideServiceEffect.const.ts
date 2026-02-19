/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Stream
 * Export: provideServiceEffect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Stream.ts
 * Generated: 2026-02-19T04:50:42.467Z
 *
 * Overview:
 * Provides a service to the stream using an effect, removing the requirement and adding the effect's error and environment.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, ServiceMap, Stream } from "effect"
 *
 * class ApiConfig extends ServiceMap.Service<ApiConfig, { readonly baseUrl: string }>()("ApiConfig") {}
 *
 * const stream = Stream.fromEffect(
 *   Effect.gen(function*() {
 *     const config = yield* Effect.service(ApiConfig)
 *     return config.baseUrl
 *   })
 * )
 *
 * const withConfig = stream.pipe(
 *   Stream.provideServiceEffect(
 *     ApiConfig,
 *     Effect.succeed({ baseUrl: "https://example.com" }).pipe(
 *       Effect.tap(() => Console.log("Loading config..."))
 *     )
 *   )
 * )
 *
 * const program = Stream.runCollect(withConfig).pipe(
 *   Effect.flatMap((values) => Console.log(values))
 * )
 *
 * Effect.runPromise(program)
 * // Output:
 * // Loading config...
 * // ["https://example.com"]
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
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as StreamModule from "effect/Stream";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "provideServiceEffect";
const exportKind = "const";
const moduleImportPath = "effect/Stream";
const sourceSummary =
  "Provides a service to the stream using an effect, removing the requirement and adding the effect's error and environment.";
const sourceExample =
  'import { Console, Effect, ServiceMap, Stream } from "effect"\n\nclass ApiConfig extends ServiceMap.Service<ApiConfig, { readonly baseUrl: string }>()("ApiConfig") {}\n\nconst stream = Stream.fromEffect(\n  Effect.gen(function*() {\n    const config = yield* Effect.service(ApiConfig)\n    return config.baseUrl\n  })\n)\n\nconst withConfig = stream.pipe(\n  Stream.provideServiceEffect(\n    ApiConfig,\n    Effect.succeed({ baseUrl: "https://example.com" }).pipe(\n      Effect.tap(() => Console.log("Loading config..."))\n    )\n  )\n)\n\nconst program = Stream.runCollect(withConfig).pipe(\n  Effect.flatMap((values) => Console.log(values))\n)\n\nEffect.runPromise(program)\n// Output:\n// Loading config...\n// ["https://example.com"]';
const moduleRecord = StreamModule as Record<string, unknown>;

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
