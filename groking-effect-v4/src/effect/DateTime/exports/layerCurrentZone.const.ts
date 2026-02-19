/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: layerCurrentZone
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:14:11.266Z
 *
 * Overview:
 * Create a Layer from the given time zone.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime, Effect } from "effect"
 *
 * const zone = DateTime.zoneMakeNamedUnsafe("Europe/London")
 * const layer = DateTime.layerCurrentZone(zone)
 *
 * const program = Effect.gen(function*() {
 *   const now = yield* DateTime.nowInCurrentZone
 *   return DateTime.formatIsoZoned(now)
 * })
 *
 * // Use the layer to provide the time zone
 * Effect.provide(program, layer)
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
import * as DateTimeModule from "effect/DateTime";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "layerCurrentZone";
const exportKind = "const";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "Create a Layer from the given time zone.";
const sourceExample =
  'import { DateTime, Effect } from "effect"\n\nconst zone = DateTime.zoneMakeNamedUnsafe("Europe/London")\nconst layer = DateTime.layerCurrentZone(zone)\n\nconst program = Effect.gen(function*() {\n  const now = yield* DateTime.nowInCurrentZone\n  return DateTime.formatIsoZoned(now)\n})\n\n// Use the layer to provide the time zone\nEffect.provide(program, layer)';
const moduleRecord = DateTimeModule as Record<string, unknown>;

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
