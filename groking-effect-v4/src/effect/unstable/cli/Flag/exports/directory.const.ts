/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Flag
 * Export: directory
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Flag.ts
 * Generated: 2026-02-19T04:14:24.460Z
 *
 * Overview:
 * Creates a directory path flag that accepts directory paths with optional existence validation.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Flag } from "effect/unstable/cli"
 * 
 * // Basic directory flag
 * const outputFlag = Flag.directory("output")
 * // Usage: --output ./build
 * 
 * // Directory that must exist
 * const sourceFlag = Flag.directory("source", { mustExist: true })
 * // Usage: --source ./src (directory must exist)
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
import * as FlagModule from "effect/unstable/cli/Flag";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "directory";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Flag";
const sourceSummary = "Creates a directory path flag that accepts directory paths with optional existence validation.";
const sourceExample = "import { Flag } from \"effect/unstable/cli\"\n\n// Basic directory flag\nconst outputFlag = Flag.directory(\"output\")\n// Usage: --output ./build\n\n// Directory that must exist\nconst sourceFlag = Flag.directory(\"source\", { mustExist: true })\n// Usage: --source ./src (directory must exist)";
const moduleRecord = FlagModule as Record<string, unknown>;

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
