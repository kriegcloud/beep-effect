/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Flag
 * Export: file
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Flag.ts
 * Generated: 2026-02-19T04:14:24.461Z
 *
 * Overview:
 * Creates a file path flag that accepts file paths with optional existence validation.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Flag } from "effect/unstable/cli"
 *
 * // Basic file flag
 * const inputFlag = Flag.file("input")
 * // Usage: --input ./data.json
 *
 * // File that must exist
 * const configFlag = Flag.file("config", { mustExist: true })
 * // Usage: --config ./config.yaml (file must exist)
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FlagModule from "effect/unstable/cli/Flag";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "file";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Flag";
const sourceSummary = "Creates a file path flag that accepts file paths with optional existence validation.";
const sourceExample =
  'import { Flag } from "effect/unstable/cli"\n\n// Basic file flag\nconst inputFlag = Flag.file("input")\n// Usage: --input ./data.json\n\n// File that must exist\nconst configFlag = Flag.file("config", { mustExist: true })\n// Usage: --config ./config.yaml (file must exist)';
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
