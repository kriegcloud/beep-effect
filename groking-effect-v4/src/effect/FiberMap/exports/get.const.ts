/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberMap
 * Export: get
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FiberMap.ts
 * Generated: 2026-02-19T04:14:13.038Z
 *
 * Overview:
 * Retrieve a fiber from the FiberMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Fiber, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *
 *   // Add a fiber to the map
 *   const fiber = yield* Effect.forkChild(Effect.succeed("Hello"))
 *   yield* FiberMap.set(map, "greeting", fiber)
 *
 *   // Retrieve the fiber with error handling
 *   const retrieved = yield* FiberMap.get(map, "greeting")
 *   if (retrieved) {
 *     const result = yield* Fiber.await(retrieved)
 *     console.log(result) // "Hello"
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
import * as FiberMapModule from "effect/FiberMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "get";
const exportKind = "const";
const moduleImportPath = "effect/FiberMap";
const sourceSummary = "Retrieve a fiber from the FiberMap.";
const sourceExample =
  'import { Effect, Fiber, FiberMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  const map = yield* FiberMap.make<string>()\n\n  // Add a fiber to the map\n  const fiber = yield* Effect.forkChild(Effect.succeed("Hello"))\n  yield* FiberMap.set(map, "greeting", fiber)\n\n  // Retrieve the fiber with error handling\n  const retrieved = yield* FiberMap.get(map, "greeting")\n  if (retrieved) {\n    const result = yield* Fiber.await(retrieved)\n    console.log(result) // "Hello"\n  }\n})';
const moduleRecord = FiberMapModule as Record<string, unknown>;

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
