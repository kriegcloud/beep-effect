/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberMap
 * Export: set
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FiberMap.ts
 * Generated: 2026-02-19T04:14:13.039Z
 *
 * Overview:
 * Add a fiber to the FiberMap. When the fiber completes, it will be removed from the FiberMap. If the key already exists in the FiberMap, the previous fiber will be interrupted. This is the Effect-wrapped version of `setUnsafe`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Fiber, FiberMap } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 * 
 *   // Create a fiber and add it to the map using Effect
 *   const fiber = yield* Effect.forkChild(Effect.succeed("Hello"))
 *   yield* FiberMap.set(map, "greeting", fiber)
 * 
 *   // The fiber will be automatically removed when it completes
 *   const result = yield* Fiber.await(fiber)
 *   console.log(result) // "Hello"
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
import * as FiberMapModule from "effect/FiberMap";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "set";
const exportKind = "const";
const moduleImportPath = "effect/FiberMap";
const sourceSummary = "Add a fiber to the FiberMap. When the fiber completes, it will be removed from the FiberMap. If the key already exists in the FiberMap, the previous fiber will be interrupted. T...";
const sourceExample = "import { Effect, Fiber, FiberMap } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const map = yield* FiberMap.make<string>()\n\n  // Create a fiber and add it to the map using Effect\n  const fiber = yield* Effect.forkChild(Effect.succeed(\"Hello\"))\n  yield* FiberMap.set(map, \"greeting\", fiber)\n\n  // The fiber will be automatically removed when it completes\n  const result = yield* Fiber.await(fiber)\n  console.log(result) // \"Hello\"\n})";
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
