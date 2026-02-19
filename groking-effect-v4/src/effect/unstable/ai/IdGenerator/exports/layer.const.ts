/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/IdGenerator
 * Export: layer
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/IdGenerator.ts
 * Generated: 2026-02-19T04:14:23.883Z
 *
 * Overview:
 * Creates a Layer that provides the IdGenerator service with custom configuration.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { IdGenerator } from "effect/unstable/ai"
 * 
 * // Create a layer for generating AI tool call IDs
 * const toolCallIdLayer = IdGenerator.layer({
 *   alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
 *   prefix: "tool_call",
 *   separator: "_",
 *   size: 12
 * })
 * 
 * const program = Effect.gen(function*() {
 *   const idGen = yield* IdGenerator.IdGenerator
 *   const toolCallId = yield* idGen.generateId()
 *   console.log(toolCallId) // "tool_call_A7XK9MP2QR5T"
 *   return toolCallId
 * }).pipe(Effect.provide(toolCallIdLayer))
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
import * as IdGeneratorModule from "effect/unstable/ai/IdGenerator";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "layer";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/IdGenerator";
const sourceSummary = "Creates a Layer that provides the IdGenerator service with custom configuration.";
const sourceExample = "import { Effect } from \"effect\"\nimport { IdGenerator } from \"effect/unstable/ai\"\n\n// Create a layer for generating AI tool call IDs\nconst toolCallIdLayer = IdGenerator.layer({\n  alphabet: \"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ\",\n  prefix: \"tool_call\",\n  separator: \"_\",\n  size: 12\n})\n\nconst program = Effect.gen(function*() {\n  const idGen = yield* IdGenerator.IdGenerator\n  const toolCallId = yield* idGen.generateId()\n  console.log(toolCallId) // \"tool_call_A7XK9MP2QR5T\"\n  return toolCallId\n}).pipe(Effect.provide(toolCallIdLayer))";
const moduleRecord = IdGeneratorModule as Record<string, unknown>;

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
