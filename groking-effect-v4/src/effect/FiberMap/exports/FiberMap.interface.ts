/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberMap
 * Export: FiberMap
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/FiberMap.ts
 * Generated: 2026-02-19T04:14:13.038Z
 *
 * Overview:
 * A FiberMap is a collection of fibers, indexed by a key. When the associated Scope is closed, all fibers in the map will be interrupted. Fibers are automatically removed from the map when they complete.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FiberMap } from "effect"
 * 
 * // Create a FiberMap with string keys
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 * 
 *   // Add some fibers to the map
 *   yield* FiberMap.run(map, "task1", Effect.succeed("Hello"))
 *   yield* FiberMap.run(map, "task2", Effect.succeed("World"))
 * 
 *   // Get the size of the map
 *   const size = yield* FiberMap.size(map)
 *   console.log(size) // 2
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as FiberMapModule from "effect/FiberMap";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "FiberMap";
const exportKind = "interface";
const moduleImportPath = "effect/FiberMap";
const sourceSummary = "A FiberMap is a collection of fibers, indexed by a key. When the associated Scope is closed, all fibers in the map will be interrupted. Fibers are automatically removed from the...";
const sourceExample = "import { Effect, FiberMap } from \"effect\"\n\n// Create a FiberMap with string keys\nconst program = Effect.gen(function*() {\n  const map = yield* FiberMap.make<string>()\n\n  // Add some fibers to the map\n  yield* FiberMap.run(map, \"task1\", Effect.succeed(\"Hello\"))\n  yield* FiberMap.run(map, \"task2\", Effect.succeed(\"World\"))\n\n  // Get the size of the map\n  const size = yield* FiberMap.size(map)\n  console.log(size) // 2\n})";
const moduleRecord = FiberMapModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
