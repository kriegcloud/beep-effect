/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/process/ChildProcessSpawner
 * Export: makeHandle
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/process/ChildProcessSpawner.ts
 * Generated: 2026-02-19T04:14:28.746Z
 *
 * Overview:
 * Constructs a new `ChildProcessHandle`.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
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
import * as ChildProcessSpawnerModule from "effect/unstable/process/ChildProcessSpawner";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeHandle";
const exportKind = "const";
const moduleImportPath = "effect/unstable/process/ChildProcessSpawner";
const sourceSummary = "Constructs a new `ChildProcessHandle`.";
const sourceExample = "";
const moduleRecord = ChildProcessSpawnerModule as Record<string, unknown>;

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
