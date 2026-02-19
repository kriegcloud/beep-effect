/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberMap
 * Export: has
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FiberMap.ts
 * Generated: 2026-02-19T04:14:13.038Z
 *
 * Overview:
 * Check if a key exists in the FiberMap. This is the Effect-wrapped version of `hasUnsafe`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FiberMap } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 * 
 *   // Add a fiber to the map
 *   yield* FiberMap.run(map, "task1", Effect.succeed("Hello"))
 * 
 *   // Check if keys exist using Effect
 *   const exists1 = yield* FiberMap.has(map, "task1")
 *   const exists2 = yield* FiberMap.has(map, "task2")
 * 
 *   console.log(exists1) // true
 *   console.log(exists2) // false
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
const exportName = "has";
const exportKind = "const";
const moduleImportPath = "effect/FiberMap";
const sourceSummary = "Check if a key exists in the FiberMap. This is the Effect-wrapped version of `hasUnsafe`.";
const sourceExample = "import { Effect, FiberMap } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const map = yield* FiberMap.make<string>()\n\n  // Add a fiber to the map\n  yield* FiberMap.run(map, \"task1\", Effect.succeed(\"Hello\"))\n\n  // Check if keys exist using Effect\n  const exists1 = yield* FiberMap.has(map, \"task1\")\n  const exists2 = yield* FiberMap.has(map, \"task2\")\n\n  console.log(exists1) // true\n  console.log(exists2) // false\n})";
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
