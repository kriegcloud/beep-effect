/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberSet
 * Export: add
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FiberSet.ts
 * Generated: 2026-02-19T04:14:13.217Z
 *
 * Overview:
 * Add a fiber to the FiberSet. When the fiber completes, it will be removed.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FiberSet } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *   const fiber = yield* Effect.forkChild(Effect.succeed("hello"))
 * 
 *   // Add the fiber to the set
 *   yield* FiberSet.add(set, fiber)
 * 
 *   // The fiber is now managed by the set
 *   console.log(yield* FiberSet.size(set)) // 1
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
import * as FiberSetModule from "effect/FiberSet";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "add";
const exportKind = "const";
const moduleImportPath = "effect/FiberSet";
const sourceSummary = "Add a fiber to the FiberSet. When the fiber completes, it will be removed.";
const sourceExample = "import { Effect, FiberSet } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const set = yield* FiberSet.make()\n  const fiber = yield* Effect.forkChild(Effect.succeed(\"hello\"))\n\n  // Add the fiber to the set\n  yield* FiberSet.add(set, fiber)\n\n  // The fiber is now managed by the set\n  console.log(yield* FiberSet.size(set)) // 1\n})";
const moduleRecord = FiberSetModule as Record<string, unknown>;

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
