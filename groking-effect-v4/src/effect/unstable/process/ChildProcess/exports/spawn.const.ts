/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/process/ChildProcess
 * Export: spawn
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/process/ChildProcess.ts
 * Generated: 2026-02-19T04:50:50.392Z
 *
 * Overview:
 * Spawn a command and return a handle for interaction.
 *
 * Source JSDoc Example:
 * ```ts
 * import { NodeServices } from "@effect/platform-node"
 * import { Console, Effect, Stream } from "effect"
 * import { ChildProcess } from "effect/unstable/process"
 *
 * const program = Effect.gen(function*() {
 *   const cmd = ChildProcess.make`long-running-process`
 *   const handle = yield* ChildProcess.spawn(cmd)
 *
 *   // Stream stdout
 *   yield* handle.stdout.pipe(
 *     Stream.decodeText(),
 *     Stream.runForEach(Console.log),
 *     Effect.forkChild
 *   )
 *
 *   // Wait for exit
 *   const exitCode = yield* handle.exitCode
 *   yield* Console.log(`Process exited with code ${exitCode}`)
 * }).pipe(Effect.provide(NodeServices.layer))
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
import * as ChildProcessModule from "effect/unstable/process/ChildProcess";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "spawn";
const exportKind = "const";
const moduleImportPath = "effect/unstable/process/ChildProcess";
const sourceSummary = "Spawn a command and return a handle for interaction.";
const sourceExample =
  'import { NodeServices } from "@effect/platform-node"\nimport { Console, Effect, Stream } from "effect"\nimport { ChildProcess } from "effect/unstable/process"\n\nconst program = Effect.gen(function*() {\n  const cmd = ChildProcess.make`long-running-process`\n  const handle = yield* ChildProcess.spawn(cmd)\n\n  // Stream stdout\n  yield* handle.stdout.pipe(\n    Stream.decodeText(),\n    Stream.runForEach(Console.log),\n    Effect.forkChild\n  )\n\n  // Wait for exit\n  const exitCode = yield* handle.exitCode\n  yield* Console.log(`Process exited with code ${exitCode}`)\n}).pipe(Effect.provide(NodeServices.layer))';
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
