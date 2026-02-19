/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: toDate
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:14:11.268Z
 *
 * Overview:
 * Convert a `DateTime` to a `Date`, applying the time zone first.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 * 
 * const utc = DateTime.makeUnsafe("2024-01-01T12:00:00Z")
 * const zoned = DateTime.makeZonedUnsafe("2024-01-01T12:00:00Z", {
 *   timeZone: "Europe/London"
 * })
 * 
 * console.log(DateTime.toDate(utc).toISOString())
 * console.log(DateTime.toDate(zoned).toISOString())
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as DateTimeModule from "effect/DateTime";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toDate";
const exportKind = "const";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "Convert a `DateTime` to a `Date`, applying the time zone first.";
const sourceExample = "import { DateTime } from \"effect\"\n\nconst utc = DateTime.makeUnsafe(\"2024-01-01T12:00:00Z\")\nconst zoned = DateTime.makeZonedUnsafe(\"2024-01-01T12:00:00Z\", {\n  timeZone: \"Europe/London\"\n})\n\nconsole.log(DateTime.toDate(utc).toISOString())\nconsole.log(DateTime.toDate(zoned).toISOString())";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
