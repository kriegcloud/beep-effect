/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Sink
 * Export: toChannel
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Sink.ts
 * Generated: 2026-02-19T04:50:40.917Z
 *
 * Overview:
 * Creates a `Channel` from a Sink.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Sink } from "effect"
 *
 * // Create a sink and extract its channel
 * const sink = Sink.succeed(42)
 * const channel = Sink.toChannel(sink)
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
import * as SinkModule from "effect/Sink";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toChannel";
const exportKind = "const";
const moduleImportPath = "effect/Sink";
const sourceSummary = "Creates a `Channel` from a Sink.";
const sourceExample =
  'import { Sink } from "effect"\n\n// Create a sink and extract its channel\nconst sink = Sink.succeed(42)\nconst channel = Sink.toChannel(sink)';
const moduleRecord = SinkModule as Record<string, unknown>;

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
