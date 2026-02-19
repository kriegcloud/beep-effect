/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: DateTime
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:14:11.265Z
 *
 * Overview:
 * A `DateTime` represents a point in time. It can optionally have a time zone associated with it.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 *
 * // Create a UTC DateTime
 * const utc: DateTime.DateTime = DateTime.nowUnsafe()
 *
 * // Create a zoned DateTime
 * const zoned: DateTime.DateTime = DateTime.makeZonedUnsafe(new Date(), {
 *   timeZone: "Europe/London"
 * })
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
const exportName = "DateTime";
const exportKind = "type";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "A `DateTime` represents a point in time. It can optionally have a time zone associated with it.";
const sourceExample =
  'import { DateTime } from "effect"\n\n// Create a UTC DateTime\nconst utc: DateTime.DateTime = DateTime.nowUnsafe()\n\n// Create a zoned DateTime\nconst zoned: DateTime.DateTime = DateTime.makeZonedUnsafe(new Date(), {\n  timeZone: "Europe/London"\n})';
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
