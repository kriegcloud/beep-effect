/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: removeTime
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:14:11.267Z
 *
 * Overview:
 * Remove the time aspect of a `DateTime`, first adjusting for the time zone. It will return a `DateTime.Utc` only containing the date.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 * 
 * // returns "2024-01-01T00:00:00Z"
 * DateTime.makeZonedUnsafe("2024-01-01T05:00:00Z", {
 *   timeZone: "Pacific/Auckland",
 *   adjustForTimeZone: true
 * }).pipe(
 *   DateTime.removeTime,
 *   DateTime.formatIso
 * )
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
const exportName = "removeTime";
const exportKind = "const";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "Remove the time aspect of a `DateTime`, first adjusting for the time zone. It will return a `DateTime.Utc` only containing the date.";
const sourceExample = "import { DateTime } from \"effect\"\n\n// returns \"2024-01-01T00:00:00Z\"\nDateTime.makeZonedUnsafe(\"2024-01-01T05:00:00Z\", {\n  timeZone: \"Pacific/Auckland\",\n  adjustForTimeZone: true\n}).pipe(\n  DateTime.removeTime,\n  DateTime.formatIso\n)";
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
