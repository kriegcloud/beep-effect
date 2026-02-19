/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberHandle
 * Export: awaitEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FiberHandle.ts
 * Generated: 2026-02-19T04:14:12.851Z
 *
 * Overview:
 * Wait for the fiber in the FiberHandle to complete.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FiberHandle } from "effect"
 * 
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 * 
 *   // Start a long-running effect
 *   yield* FiberHandle.run(handle, Effect.sleep(1000))
 * 
 *   // Wait for the fiber to complete
 *   yield* FiberHandle.awaitEmpty(handle)
 * 
 *   console.log("Fiber completed")
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
import * as FiberHandleModule from "effect/FiberHandle";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "awaitEmpty";
const exportKind = "const";
const moduleImportPath = "effect/FiberHandle";
const sourceSummary = "Wait for the fiber in the FiberHandle to complete.";
const sourceExample = "import { Effect, FiberHandle } from \"effect\"\n\nEffect.gen(function*() {\n  const handle = yield* FiberHandle.make()\n\n  // Start a long-running effect\n  yield* FiberHandle.run(handle, Effect.sleep(1000))\n\n  // Wait for the fiber to complete\n  yield* FiberHandle.awaitEmpty(handle)\n\n  console.log(\"Fiber completed\")\n})";
const moduleRecord = FiberHandleModule as Record<string, unknown>;

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
