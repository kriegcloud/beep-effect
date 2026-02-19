/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: setZone
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:14:11.267Z
 *
 * Overview:
 * Set the time zone of a `DateTime`, returning a new `DateTime.Zoned`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime, Effect } from "effect"
 * 
 * Effect.gen(function*() {
 *   const now = yield* DateTime.now
 *   const zone = DateTime.zoneMakeNamedUnsafe("Europe/London")
 * 
 *   // set the time zone
 *   const zoned: DateTime.Zoned = DateTime.setZone(now, zone)
 * })
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
const exportName = "setZone";
const exportKind = "const";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "Set the time zone of a `DateTime`, returning a new `DateTime.Zoned`.";
const sourceExample = "import { DateTime, Effect } from \"effect\"\n\nEffect.gen(function*() {\n  const now = yield* DateTime.now\n  const zone = DateTime.zoneMakeNamedUnsafe(\"Europe/London\")\n\n  // set the time zone\n  const zoned: DateTime.Zoned = DateTime.setZone(now, zone)\n})";
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
