/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: failSync
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.637Z
 *
 * Overview:
 * Constructs a channel that fails immediately with the specified lazily evaluated error.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel } from "effect"
 * 
 * // Create a channel that fails with a lazily computed error
 * const failedChannel = Channel.failSync(() => {
 *   console.log("Computing error...")
 *   return new Error("Computed at runtime")
 * })
 * 
 * // The error computation is deferred until the channel runs
 * const conditionalError = Channel.failSync(() =>
 *   Math.random() > 0.5 ? "Error A" : "Error B"
 * )
 * 
 * // Use with expensive error construction
 * const expensiveError = Channel.failSync(() => {
 *   const timestamp = Date.now()
 *   return new Error(`Failed at: ${timestamp}`)
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
import * as ChannelModule from "effect/Channel";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "failSync";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Constructs a channel that fails immediately with the specified lazily evaluated error.";
const sourceExample = "import { Channel } from \"effect\"\n\n// Create a channel that fails with a lazily computed error\nconst failedChannel = Channel.failSync(() => {\n  console.log(\"Computing error...\")\n  return new Error(\"Computed at runtime\")\n})\n\n// The error computation is deferred until the channel runs\nconst conditionalError = Channel.failSync(() =>\n  Math.random() > 0.5 ? \"Error A\" : \"Error B\"\n)\n\n// Use with expensive error construction\nconst expensiveError = Channel.failSync(() => {\n  const timestamp = Date.now()\n  return new Error(`Failed at: ${timestamp}`)\n})";
const moduleRecord = ChannelModule as Record<string, unknown>;

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
