/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: satisfiesServicesType
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.052Z
 *
 * Overview:
 * Ensures that the provided schedule respects a specified context type.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schedule } from "effect"
 * 
 * // Define service interfaces (type-level only)
 * interface Logger {
 *   readonly log: (message: string) => void
 * }
 * 
 * interface Database {
 *   readonly query: (sql: string) => Promise<unknown>
 * }
 * 
 * // Ensure schedule requires Logger service
 * const loggerSchedule = Schedule.spaced("1 second").pipe(
 *   Schedule.satisfiesServicesType<Logger>()
 * )
 * 
 * // Ensure schedule requires both Logger and Database services
 * const multiServiceSchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.satisfiesServicesType<Logger | Database>()
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
import * as ScheduleModule from "effect/Schedule";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "satisfiesServicesType";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "Ensures that the provided schedule respects a specified context type.";
const sourceExample = "import { Schedule } from \"effect\"\n\n// Define service interfaces (type-level only)\ninterface Logger {\n  readonly log: (message: string) => void\n}\n\ninterface Database {\n  readonly query: (sql: string) => Promise<unknown>\n}\n\n// Ensure schedule requires Logger service\nconst loggerSchedule = Schedule.spaced(\"1 second\").pipe(\n  Schedule.satisfiesServicesType<Logger>()\n)\n\n// Ensure schedule requires both Logger and Database services\nconst multiServiceSchedule = Schedule.exponential(\"100 millis\").pipe(\n  Schedule.satisfiesServicesType<Logger | Database>()\n)";
const moduleRecord = ScheduleModule as Record<string, unknown>;

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
