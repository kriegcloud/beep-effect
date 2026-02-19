/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/ConfigProvider
 * Export: fromDotEnv
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/ConfigProvider.ts
 * Generated: 2026-02-19T04:50:34.513Z
 *
 * Overview:
 * Creates a `ConfigProvider` by reading and parsing a `.env` file from the file system.
 *
 * Source JSDoc Example:
 * ```ts
 * import { ConfigProvider, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const provider = yield* ConfigProvider.fromDotEnv()
 *   return provider
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
import * as ConfigProviderModule from "effect/ConfigProvider";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromDotEnv";
const exportKind = "const";
const moduleImportPath = "effect/ConfigProvider";
const sourceSummary = "Creates a `ConfigProvider` by reading and parsing a `.env` file from the file system.";
const sourceExample =
  'import { ConfigProvider, Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  const provider = yield* ConfigProvider.fromDotEnv()\n  return provider\n})';
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
