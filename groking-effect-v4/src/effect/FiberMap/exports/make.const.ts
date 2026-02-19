/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberMap
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FiberMap.ts
 * Generated: 2026-02-19T04:14:13.038Z
 *
 * Overview:
 * A FiberMap can be used to store a collection of fibers, indexed by some key. When the associated Scope is closed, all fibers in the map will be interrupted.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FiberMap } from "effect"
 * 
 * Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 * 
 *   // run some effects and add the fibers to the map
 *   yield* FiberMap.run(map, "fiber a", Effect.never)
 *   yield* FiberMap.run(map, "fiber b", Effect.never)
 * 
 *   yield* Effect.sleep(1000)
 * }).pipe(
 *   Effect.scoped // The fibers will be interrupted when the scope is closed
 * )
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
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/FiberMap";
const sourceSummary = "A FiberMap can be used to store a collection of fibers, indexed by some key. When the associated Scope is closed, all fibers in the map will be interrupted.";
const sourceExample = "import { Effect, FiberMap } from \"effect\"\n\nEffect.gen(function*() {\n  const map = yield* FiberMap.make<string>()\n\n  // run some effects and add the fibers to the map\n  yield* FiberMap.run(map, \"fiber a\", Effect.never)\n  yield* FiberMap.run(map, \"fiber b\", Effect.never)\n\n  yield* Effect.sleep(1000)\n}).pipe(\n  Effect.scoped // The fibers will be interrupted when the scope is closed\n)";
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
