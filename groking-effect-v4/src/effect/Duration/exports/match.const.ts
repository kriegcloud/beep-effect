/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Duration
 * Export: match
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Duration.ts
 * Generated: 2026-02-19T04:14:11.323Z
 *
 * Overview:
 * Pattern matches on a Duration, providing different handlers for millis and nanos.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Duration } from "effect"
 * 
 * const result = Duration.match(Duration.seconds(5), {
 *   onMillis: (millis) => `${millis} milliseconds`,
 *   onNanos: (nanos) => `${nanos} nanoseconds`,
 *   onInfinity: () => "infinite"
 * })
 * console.log(result) // "5000 milliseconds"
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
import * as DurationModule from "effect/Duration";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "match";
const exportKind = "const";
const moduleImportPath = "effect/Duration";
const sourceSummary = "Pattern matches on a Duration, providing different handlers for millis and nanos.";
const sourceExample = "import { Duration } from \"effect\"\n\nconst result = Duration.match(Duration.seconds(5), {\n  onMillis: (millis) => `${millis} milliseconds`,\n  onNanos: (nanos) => `${nanos} nanoseconds`,\n  onInfinity: () => \"infinite\"\n})\nconsole.log(result) // \"5000 milliseconds\"";
const moduleRecord = DurationModule as Record<string, unknown>;

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
