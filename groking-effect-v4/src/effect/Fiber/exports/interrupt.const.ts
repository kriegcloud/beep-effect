/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Fiber
 * Export: interrupt
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Fiber.ts
 * Generated: 2026-02-19T04:14:12.663Z
 *
 * Overview:
 * Interrupts a fiber, causing it to stop executing and clean up any acquired resources.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Fiber } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const fiber = yield* Effect.forkChild(
 *     Effect.delay("1 second")(Effect.succeed(42))
 *   )
 *   yield* Fiber.interrupt(fiber)
 *   console.log("Fiber interrupted")
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FiberModule from "effect/Fiber";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "interrupt";
const exportKind = "const";
const moduleImportPath = "effect/Fiber";
const sourceSummary = "Interrupts a fiber, causing it to stop executing and clean up any acquired resources.";
const sourceExample =
  'import { Effect, Fiber } from "effect"\n\nconst program = Effect.gen(function*() {\n  const fiber = yield* Effect.forkChild(\n    Effect.delay("1 second")(Effect.succeed(42))\n  )\n  yield* Fiber.interrupt(fiber)\n  console.log("Fiber interrupted")\n})';
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
