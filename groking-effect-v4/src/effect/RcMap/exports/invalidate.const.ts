/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RcMap
 * Export: invalidate
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RcMap.ts
 * Generated: 2026-02-19T04:14:16.239Z
 *
 * Overview:
 * Invalidates and removes a specific key from the RcMap. If the resource is not currently in use (reference count is 0), it will be immediately released.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, RcMap } from "effect"
 * 
 * Effect.gen(function*() {
 *   const map = yield* RcMap.make({
 *     lookup: (key: string) =>
 *       Effect.acquireRelease(
 *         Effect.succeed(`Resource: ${key}`),
 *         () => Effect.log(`Released ${key}`)
 *       )
 *   })
 * 
 *   // Get a resource
 *   yield* RcMap.get(map, "cache")
 * 
 *   // Invalidate the resource - it will be removed from the map
 *   // and released if no longer in use
 *   yield* RcMap.invalidate(map, "cache")
 * 
 *   // Next access will create a new resource
 *   yield* RcMap.get(map, "cache")
 * }).pipe(Effect.scoped)
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
import * as RcMapModule from "effect/RcMap";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "invalidate";
const exportKind = "const";
const moduleImportPath = "effect/RcMap";
const sourceSummary = "Invalidates and removes a specific key from the RcMap. If the resource is not currently in use (reference count is 0), it will be immediately released.";
const sourceExample = "import { Effect, RcMap } from \"effect\"\n\nEffect.gen(function*() {\n  const map = yield* RcMap.make({\n    lookup: (key: string) =>\n      Effect.acquireRelease(\n        Effect.succeed(`Resource: ${key}`),\n        () => Effect.log(`Released ${key}`)\n      )\n  })\n\n  // Get a resource\n  yield* RcMap.get(map, \"cache\")\n\n  // Invalidate the resource - it will be removed from the map\n  // and released if no longer in use\n  yield* RcMap.invalidate(map, \"cache\")\n\n  // Next access will create a new resource\n  yield* RcMap.get(map, \"cache\")\n}).pipe(Effect.scoped)";
const moduleRecord = RcMapModule as Record<string, unknown>;

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
