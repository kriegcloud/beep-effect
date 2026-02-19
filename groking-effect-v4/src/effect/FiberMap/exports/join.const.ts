/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberMap
 * Export: join
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FiberMap.ts
 * Generated: 2026-02-19T04:14:13.038Z
 *
 * Overview:
 * Join all fibers in the FiberMap. If any of the Fiber's in the map terminate with a failure, the returned Effect will terminate with the first failure that occurred.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FiberMap } from "effect"
 * 
 * Effect.gen(function*() {
 *   const map = yield* FiberMap.make()
 *   yield* FiberMap.set(map, "a", Effect.runFork(Effect.fail("error")))
 * 
 *   // parent fiber will fail with "error"
 *   yield* FiberMap.join(map)
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
const exportName = "join";
const exportKind = "const";
const moduleImportPath = "effect/FiberMap";
const sourceSummary = "Join all fibers in the FiberMap. If any of the Fiber's in the map terminate with a failure, the returned Effect will terminate with the first failure that occurred.";
const sourceExample = "import { Effect, FiberMap } from \"effect\"\n\nEffect.gen(function*() {\n  const map = yield* FiberMap.make()\n  yield* FiberMap.set(map, \"a\", Effect.runFork(Effect.fail(\"error\")))\n\n  // parent fiber will fail with \"error\"\n  yield* FiberMap.join(map)\n})";
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
