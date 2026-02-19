/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: zoneMakeNamedUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:14:11.269Z
 *
 * Overview:
 * Attempt to create a named time zone from a IANA time zone identifier.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 *
 * const londonZone = DateTime.zoneMakeNamedUnsafe("Europe/London")
 * console.log(DateTime.zoneToString(londonZone)) // "Europe/London"
 *
 * const tokyoZone = DateTime.zoneMakeNamedUnsafe("Asia/Tokyo")
 * console.log(DateTime.zoneToString(tokyoZone)) // "Asia/Tokyo"
 *
 * // This would throw an IllegalArgumentError:
 * // DateTime.zoneMakeNamedUnsafe("Invalid/Zone")
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
const exportName = "zoneMakeNamedUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "Attempt to create a named time zone from a IANA time zone identifier.";
const sourceExample =
  'import { DateTime } from "effect"\n\nconst londonZone = DateTime.zoneMakeNamedUnsafe("Europe/London")\nconsole.log(DateTime.zoneToString(londonZone)) // "Europe/London"\n\nconst tokyoZone = DateTime.zoneMakeNamedUnsafe("Asia/Tokyo")\nconsole.log(DateTime.zoneToString(tokyoZone)) // "Asia/Tokyo"\n\n// This would throw an IllegalArgumentError:\n// DateTime.zoneMakeNamedUnsafe("Invalid/Zone")';
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
