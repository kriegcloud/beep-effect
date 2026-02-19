/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Fiber
 * Export: isFiber
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Fiber.ts
 * Generated: 2026-02-19T04:14:12.663Z
 *
 * Overview:
 * Tests if a value is a Fiber. This is a type guard that can be used to determine if an unknown value is a Fiber instance.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Fiber } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create a fiber
 *   const fiber = yield* Effect.forkChild(Effect.succeed(42))
 *
 *   // Test if values are fibers
 *   console.log(Fiber.isFiber(fiber)) // true
 *   console.log(Fiber.isFiber("hello")) // false
 *   console.log(Fiber.isFiber(42)) // false
 *   console.log(Fiber.isFiber(null)) // false
 *
 *   // Use as a type guard
 *   const maybeValue: unknown = fiber
 *   if (Fiber.isFiber(maybeValue)) {
 *     // TypeScript knows maybeValue is a Fiber here
 *     console.log(`Fiber ID: ${maybeValue.id}`)
 *   }
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
const exportName = "isFiber";
const exportKind = "const";
const moduleImportPath = "effect/Fiber";
const sourceSummary =
  "Tests if a value is a Fiber. This is a type guard that can be used to determine if an unknown value is a Fiber instance.";
const sourceExample =
  'import { Effect, Fiber } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Create a fiber\n  const fiber = yield* Effect.forkChild(Effect.succeed(42))\n\n  // Test if values are fibers\n  console.log(Fiber.isFiber(fiber)) // true\n  console.log(Fiber.isFiber("hello")) // false\n  console.log(Fiber.isFiber(42)) // false\n  console.log(Fiber.isFiber(null)) // false\n\n  // Use as a type guard\n  const maybeValue: unknown = fiber\n  if (Fiber.isFiber(maybeValue)) {\n    // TypeScript knows maybeValue is a Fiber here\n    console.log(`Fiber ID: ${maybeValue.id}`)\n  }\n})';
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
