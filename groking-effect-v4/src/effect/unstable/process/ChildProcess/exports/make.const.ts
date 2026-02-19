/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/process/ChildProcess
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/process/ChildProcess.ts
 * Generated: 2026-02-19T04:14:28.739Z
 *
 * Overview:
 * Create a command from a template literal, options + template, or array form.
 *
 * Source JSDoc Example:
 * ```ts
 * import { ChildProcess } from "effect/unstable/process"
 * 
 * // Template literal form
 * const cmd1 = ChildProcess.make`echo "hello"`
 * 
 * // With options
 * const cmd2 = ChildProcess.make({ cwd: "/tmp" })`ls -la`
 * 
 * // Array form
 * const cmd3 = ChildProcess.make("git", ["status"])
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
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/unstable/process/ChildProcess";
const sourceSummary = "Create a command from a template literal, options + template, or array form.";
const sourceExample = "import { ChildProcess } from \"effect/unstable/process\"\n\n// Template literal form\nconst cmd1 = ChildProcess.make`echo \"hello\"`\n\n// With options\nconst cmd2 = ChildProcess.make({ cwd: \"/tmp\" })`ls -la`\n\n// Array form\nconst cmd3 = ChildProcess.make(\"git\", [\"status\"])";
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
