/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: Zoned
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:14:11.268Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 *
 * const zoned = DateTime.makeZonedUnsafe(new Date(), {
 *   timeZone: "Europe/London"
 * })
 *
 * if (DateTime.isZoned(zoned)) {
 *   console.log(zoned._tag) // "Zoned"
 *   console.log(zoned.epochMillis) // timestamp in milliseconds
 *   console.log(DateTime.zoneToString(zoned.zone)) // "Europe/London"
 * }
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as DateTimeModule from "effect/DateTime";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Zoned";
const exportKind = "interface";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample =
  'import { DateTime } from "effect"\n\nconst zoned = DateTime.makeZonedUnsafe(new Date(), {\n  timeZone: "Europe/London"\n})\n\nif (DateTime.isZoned(zoned)) {\n  console.log(zoned._tag) // "Zoned"\n  console.log(zoned.epochMillis) // timestamp in milliseconds\n  console.log(DateTime.zoneToString(zoned.zone)) // "Europe/London"\n}';
const moduleRecord = DateTimeModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
