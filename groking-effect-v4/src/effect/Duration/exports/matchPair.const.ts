/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Duration
 * Export: matchPair
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Duration.ts
 * Generated: 2026-02-19T04:14:11.323Z
 *
 * Overview:
 * Pattern matches on two `Duration`s, providing handlers that receive both values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Duration } from "effect"
 * 
 * const sum = Duration.matchPair(Duration.seconds(3), Duration.seconds(2), {
 *   onMillis: (a, b) => a + b,
 *   onNanos: (a, b) => Number(a + b),
 *   onInfinity: () => Infinity
 * })
 * console.log(sum) // 5000
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
const exportName = "matchPair";
const exportKind = "const";
const moduleImportPath = "effect/Duration";
const sourceSummary = "Pattern matches on two `Duration`s, providing handlers that receive both values.";
const sourceExample = "import { Duration } from \"effect\"\n\nconst sum = Duration.matchPair(Duration.seconds(3), Duration.seconds(2), {\n  onMillis: (a, b) => a + b,\n  onNanos: (a, b) => Number(a + b),\n  onInfinity: () => Infinity\n})\nconsole.log(sum) // 5000";
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
