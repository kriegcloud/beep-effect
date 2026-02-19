/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: CurrentTimeZone
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:14:11.264Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Access the current time zone service
 *   const zone = yield* DateTime.CurrentTimeZone.asEffect()
 *   console.log(DateTime.zoneToString(zone))
 * })
 *
 * // Provide a time zone
 * const layer = DateTime.layerCurrentZoneNamed("Europe/London")
 * Effect.provide(program, layer)
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as DateTimeModule from "effect/DateTime";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "CurrentTimeZone";
const exportKind = "class";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample =
  'import { DateTime, Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Access the current time zone service\n  const zone = yield* DateTime.CurrentTimeZone.asEffect()\n  console.log(DateTime.zoneToString(zone))\n})\n\n// Provide a time zone\nconst layer = DateTime.layerCurrentZoneNamed("Europe/London")\nEffect.provide(program, layer)';
const moduleRecord = DateTimeModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleClassDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata and class-like surface information.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleConstructionProbe = Effect.gen(function* () {
  yield* Console.log("Attempt a zero-arg construction probe.");
  yield* probeNamedExportConstructor({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧱",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Class Discovery",
      description: "Inspect runtime shape and discover class metadata.",
      run: exampleClassDiscovery,
    },
    {
      title: "Zero-Arg Construction Probe",
      description: "Attempt construction and report constructor behavior.",
      run: exampleConstructionProbe,
    },
  ],
});

BunRuntime.runMain(program);
