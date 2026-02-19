/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Fiber
 * Export: awaitAll
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Fiber.ts
 * Generated: 2026-02-19T04:50:36.065Z
 *
 * Overview:
 * Waits for all fibers in the provided iterable to complete and returns an array of their exit values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Fiber } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const fiber1 = yield* Effect.forkChild(Effect.succeed(1))
 *   const fiber2 = yield* Effect.forkChild(Effect.succeed(2))
 *   const exits = yield* Fiber.awaitAll([fiber1, fiber2])
 *   console.log(exits) // [Exit.succeed(1), Exit.succeed(2)]
 * })
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
import * as FiberModule from "effect/Fiber";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "awaitAll";
const exportKind = "const";
const moduleImportPath = "effect/Fiber";
const sourceSummary =
  "Waits for all fibers in the provided iterable to complete and returns an array of their exit values.";
const sourceExample =
  'import { Effect, Fiber } from "effect"\n\nconst program = Effect.gen(function*() {\n  const fiber1 = yield* Effect.forkChild(Effect.succeed(1))\n  const fiber2 = yield* Effect.forkChild(Effect.succeed(2))\n  const exits = yield* Fiber.awaitAll([fiber1, fiber2])\n  console.log(exits) // [Exit.succeed(1), Exit.succeed(2)]\n})';
const moduleRecord = FiberModule as Record<string, unknown>;

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
