/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: toUtc
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:14:11.268Z
 *
 * Overview:
 * For a `DateTime` returns a new `DateTime.Utc`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 * 
 * const now = DateTime.makeZonedUnsafe({ year: 2024 }, {
 *   timeZone: "Europe/London"
 * })
 * 
 * // set as UTC
 * const utc: DateTime.Utc = DateTime.toUtc(now)
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
const exportName = "toUtc";
const exportKind = "const";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "For a `DateTime` returns a new `DateTime.Utc`.";
const sourceExample = "import { DateTime } from \"effect\"\n\nconst now = DateTime.makeZonedUnsafe({ year: 2024 }, {\n  timeZone: \"Europe/London\"\n})\n\n// set as UTC\nconst utc: DateTime.Utc = DateTime.toUtc(now)";
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
