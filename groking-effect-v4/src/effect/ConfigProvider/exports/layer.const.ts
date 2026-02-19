/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ConfigProvider
 * Export: layer
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/ConfigProvider.ts
 * Generated: 2026-02-19T04:14:11.183Z
 *
 * Overview:
 * Installs a `ConfigProvider` as the active provider for all downstream effects, replacing any previously installed provider.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Config, ConfigProvider, Effect, Layer } from "effect"
 *
 * const TestLayer = ConfigProvider.layer(
 *   ConfigProvider.fromUnknown({ port: 8080 })
 * )
 *
 * const program = Effect.gen(function*() {
 *   const port = yield* Config.number("port")
 *   return port
 * })
 *
 * // Effect.runSync(Effect.provide(program, TestLayer)) // 8080
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
import * as ConfigProviderModule from "effect/ConfigProvider";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "layer";
const exportKind = "const";
const moduleImportPath = "effect/ConfigProvider";
const sourceSummary =
  "Installs a `ConfigProvider` as the active provider for all downstream effects, replacing any previously installed provider.";
const sourceExample =
  'import { Config, ConfigProvider, Effect, Layer } from "effect"\n\nconst TestLayer = ConfigProvider.layer(\n  ConfigProvider.fromUnknown({ port: 8080 })\n)\n\nconst program = Effect.gen(function*() {\n  const port = yield* Config.number("port")\n  return port\n})\n\n// Effect.runSync(Effect.provide(program, TestLayer)) // 8080';
const moduleRecord = ConfigProviderModule as Record<string, unknown>;

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
