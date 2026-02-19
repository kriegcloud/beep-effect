/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/process/ChildProcess
 * Export: PipeOptions
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/process/ChildProcess.ts
 * Generated: 2026-02-19T04:14:28.739Z
 *
 * Overview:
 * Options for controlling how commands are piped together.
 *
 * Source JSDoc Example:
 * ```ts
 * import { ChildProcess } from "effect/unstable/process"
 * 
 * // Pipe stderr instead of stdout
 * const pipeline = ChildProcess.make`my-program`.pipe(
 *   ChildProcess.pipeTo(ChildProcess.make`grep error`, { from: "stderr" })
 * )
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ChildProcessModule from "effect/unstable/process/ChildProcess";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "PipeOptions";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/process/ChildProcess";
const sourceSummary = "Options for controlling how commands are piped together.";
const sourceExample = "import { ChildProcess } from \"effect/unstable/process\"\n\n// Pipe stderr instead of stdout\nconst pipeline = ChildProcess.make`my-program`.pipe(\n  ChildProcess.pipeTo(ChildProcess.make`grep error`, { from: \"stderr\" })\n)";
const moduleRecord = ChildProcessModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
