/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Fiber
 * Export: interruptAs
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Fiber.ts
 * Generated: 2026-02-19T04:14:12.663Z
 *
 * Overview:
 * Interrupts a fiber with a specific fiber ID as the interruptor. This allows tracking which fiber initiated the interruption.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Fiber } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const targetFiber = yield* Effect.forkChild(
 *     Effect.delay("5 seconds")(Effect.succeed("task completed"))
 *   )
 * 
 *   // Interrupt the fiber, specifying fiber ID 123 as the interruptor
 *   yield* Fiber.interruptAs(targetFiber, 123)
 *   console.log("Fiber interrupted by fiber #123")
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
import * as FiberModule from "effect/Fiber";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "interruptAs";
const exportKind = "const";
const moduleImportPath = "effect/Fiber";
const sourceSummary = "Interrupts a fiber with a specific fiber ID as the interruptor. This allows tracking which fiber initiated the interruption.";
const sourceExample = "import { Effect, Fiber } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const targetFiber = yield* Effect.forkChild(\n    Effect.delay(\"5 seconds\")(Effect.succeed(\"task completed\"))\n  )\n\n  // Interrupt the fiber, specifying fiber ID 123 as the interruptor\n  yield* Fiber.interruptAs(targetFiber, 123)\n  console.log(\"Fiber interrupted by fiber #123\")\n})";
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
