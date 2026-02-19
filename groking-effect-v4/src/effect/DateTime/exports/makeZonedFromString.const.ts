/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: makeZonedFromString
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:14:11.267Z
 *
 * Overview:
 * Create a `DateTime.Zoned` from a string.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 * 
 * const result1 = DateTime.makeZonedFromString(
 *   "2024-01-01T12:00:00+02:00[Europe/Berlin]"
 * )
 * console.log(result1 !== undefined) // true
 * 
 * const result2 = DateTime.makeZonedFromString("2024-01-01T12:00:00Z")
 * console.log(result2 !== undefined) // true
 * 
 * const invalid = DateTime.makeZonedFromString("invalid")
 * console.log(invalid === undefined) // true
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
const exportName = "makeZonedFromString";
const exportKind = "const";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "Create a `DateTime.Zoned` from a string.";
const sourceExample = "import { DateTime } from \"effect\"\n\nconst result1 = DateTime.makeZonedFromString(\n  \"2024-01-01T12:00:00+02:00[Europe/Berlin]\"\n)\nconsole.log(result1 !== undefined) // true\n\nconst result2 = DateTime.makeZonedFromString(\"2024-01-01T12:00:00Z\")\nconsole.log(result2 !== undefined) // true\n\nconst invalid = DateTime.makeZonedFromString(\"invalid\")\nconsole.log(invalid === undefined) // true";
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
