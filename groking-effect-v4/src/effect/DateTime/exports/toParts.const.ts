/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: toParts
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:14:11.268Z
 *
 * Overview:
 * Get the different parts of a `DateTime` as an object.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 * 
 * const dt = DateTime.makeUnsafe("2024-01-01T12:30:45.123Z")
 * const parts = DateTime.toParts(dt)
 * 
 * console.log(parts)
 * // {
 * //   year: 2024,
 * //   month: 1,
 * //   day: 1,
 * //   hours: 12,
 * //   minutes: 30,
 * //   seconds: 45,
 * //   millis: 123,
 * //   weekDay: 1 // Monday
 * // }
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
const exportName = "toParts";
const exportKind = "const";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "Get the different parts of a `DateTime` as an object.";
const sourceExample = "import { DateTime } from \"effect\"\n\nconst dt = DateTime.makeUnsafe(\"2024-01-01T12:30:45.123Z\")\nconst parts = DateTime.toParts(dt)\n\nconsole.log(parts)\n// {\n//   year: 2024,\n//   month: 1,\n//   day: 1,\n//   hours: 12,\n//   minutes: 30,\n//   seconds: 45,\n//   millis: 123,\n//   weekDay: 1 // Monday\n// }";
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
