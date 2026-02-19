/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/process/ChildProcess
 * Export: pipeTo
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/process/ChildProcess.ts
 * Generated: 2026-02-19T04:14:28.739Z
 *
 * Overview:
 * Pipe the output of one command to the input of another.
 *
 * Source JSDoc Example:
 * ```ts
 * import { ChildProcess } from "effect/unstable/process"
 * 
 * // Pipe stdout (default)
 * const pipeline1 = ChildProcess.make`cat file.txt`.pipe(
 *   ChildProcess.pipeTo(ChildProcess.make`grep pattern`)
 * )
 * 
 * // Pipe stderr instead of stdout
 * const pipeline2 = ChildProcess.make`my-program`.pipe(
 *   ChildProcess.pipeTo(ChildProcess.make`grep error`, { from: "stderr" })
 * )
 * 
 * // Pipe combined stdout and stderr
 * const pipeline3 = ChildProcess.make`my-program`.pipe(
 *   ChildProcess.pipeTo(ChildProcess.make`tee output.log`, { from: "all" })
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
import * as ChildProcessModule from "effect/unstable/process/ChildProcess";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "pipeTo";
const exportKind = "const";
const moduleImportPath = "effect/unstable/process/ChildProcess";
const sourceSummary = "Pipe the output of one command to the input of another.";
const sourceExample = "import { ChildProcess } from \"effect/unstable/process\"\n\n// Pipe stdout (default)\nconst pipeline1 = ChildProcess.make`cat file.txt`.pipe(\n  ChildProcess.pipeTo(ChildProcess.make`grep pattern`)\n)\n\n// Pipe stderr instead of stdout\nconst pipeline2 = ChildProcess.make`my-program`.pipe(\n  ChildProcess.pipeTo(ChildProcess.make`grep error`, { from: \"stderr\" })\n)\n\n// Pipe combined stdout and stderr\nconst pipeline3 = ChildProcess.make`my-program`.pipe(\n  ChildProcess.pipeTo(ChildProcess.make`tee output.log`, { from: \"all\" })\n)";
const moduleRecord = ChildProcessModule as Record<string, unknown>;

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
