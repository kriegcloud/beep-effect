/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: setZoneNamedUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:50:34.614Z
 *
 * Overview:
 * Set the time zone of a `DateTime` from an IANA time zone identifier. If the time zone is invalid, an `IllegalArgumentError` will be thrown.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime, Effect } from "effect"
 *
 * Effect.gen(function*() {
 *   const now = yield* DateTime.now
 *   // set the time zone
 *   DateTime.setZoneNamedUnsafe(now, "Europe/London")
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
import * as Console from "effect/Console";
import * as DateTimeModule from "effect/DateTime";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "setZoneNamedUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/DateTime";
const sourceSummary =
  "Set the time zone of a `DateTime` from an IANA time zone identifier. If the time zone is invalid, an `IllegalArgumentError` will be thrown.";
const sourceExample =
  'import { DateTime, Effect } from "effect"\n\nEffect.gen(function*() {\n  const now = yield* DateTime.now\n  // set the time zone\n  DateTime.setZoneNamedUnsafe(now, "Europe/London")\n})';
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
