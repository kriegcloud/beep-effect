/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Toolkit
 * Export: merge
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Toolkit.ts
 * Generated: 2026-02-19T04:50:45.987Z
 *
 * Overview:
 * Merges multiple toolkits into a single toolkit.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 * import { Tool, Toolkit } from "effect/unstable/ai"
 *
 * const mathToolkit = Toolkit.make(
 *   Tool.make("add", { success: Schema.Number }),
 *   Tool.make("subtract", { success: Schema.Number })
 * )
 *
 * const utilityToolkit = Toolkit.make(
 *   Tool.make("get_time", { success: Schema.Number }),
 *   Tool.make("get_weather", { success: Schema.String })
 * )
 *
 * const combined = Toolkit.merge(mathToolkit, utilityToolkit)
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
import * as Effect from "effect/Effect";
import * as ToolkitModule from "effect/unstable/ai/Toolkit";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "merge";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/Toolkit";
const sourceSummary = "Merges multiple toolkits into a single toolkit.";
const sourceExample =
  'import { Schema } from "effect"\nimport { Tool, Toolkit } from "effect/unstable/ai"\n\nconst mathToolkit = Toolkit.make(\n  Tool.make("add", { success: Schema.Number }),\n  Tool.make("subtract", { success: Schema.Number })\n)\n\nconst utilityToolkit = Toolkit.make(\n  Tool.make("get_time", { success: Schema.Number }),\n  Tool.make("get_weather", { success: Schema.String })\n)\n\nconst combined = Toolkit.merge(mathToolkit, utilityToolkit)';
const moduleRecord = ToolkitModule as Record<string, unknown>;

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
