/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Tool
 * Export: Strict
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Tool.ts
 * Generated: 2026-02-19T04:14:24.148Z
 *
 * Overview:
 * Annotation controlling whether strict JSON schema mode is enabled for a tool.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Tool } from "effect/unstable/ai"
 * 
 * const flexibleTool = Tool.make("search")
 *   .annotate(Tool.Strict, false)
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
import * as ToolModule from "effect/unstable/ai/Tool";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Strict";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/Tool";
const sourceSummary = "Annotation controlling whether strict JSON schema mode is enabled for a tool.";
const sourceExample = "import { Tool } from \"effect/unstable/ai\"\n\nconst flexibleTool = Tool.make(\"search\")\n  .annotate(Tool.Strict, false)";
const moduleRecord = ToolModule as Record<string, unknown>;

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
