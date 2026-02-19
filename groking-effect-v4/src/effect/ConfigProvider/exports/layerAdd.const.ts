/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ConfigProvider
 * Export: layerAdd
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/ConfigProvider.ts
 * Generated: 2026-02-19T04:50:34.513Z
 *
 * Overview:
 * Creates a Layer that composes a new `ConfigProvider` with the currently active one, rather than replacing it.
 *
 * Source JSDoc Example:
 * ```ts
 * import { ConfigProvider } from "effect"
 *
 * const defaults = ConfigProvider.fromUnknown({
 *   HOST: "localhost",
 *   PORT: "3000"
 * })
 *
 * // The current env provider is tried first; `defaults` is the fallback
 * const DefaultsLayer = ConfigProvider.layerAdd(defaults)
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
import * as ConfigProviderModule from "effect/ConfigProvider";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "layerAdd";
const exportKind = "const";
const moduleImportPath = "effect/ConfigProvider";
const sourceSummary =
  "Creates a Layer that composes a new `ConfigProvider` with the currently active one, rather than replacing it.";
const sourceExample =
  'import { ConfigProvider } from "effect"\n\nconst defaults = ConfigProvider.fromUnknown({\n  HOST: "localhost",\n  PORT: "3000"\n})\n\n// The current env provider is tried first; `defaults` is the fallback\nconst DefaultsLayer = ConfigProvider.layerAdd(defaults)';
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
