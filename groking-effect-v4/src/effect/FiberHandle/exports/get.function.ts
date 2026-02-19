/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberHandle
 * Export: get
 * Kind: function
 * Source: .repos/effect-smol/packages/effect/src/FiberHandle.ts
 * Generated: 2026-02-19T04:14:12.851Z
 *
 * Overview:
 * Retrieve the fiber from the FiberHandle.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Fiber, FiberHandle } from "effect"
 * 
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 * 
 *   // Add a fiber
 *   yield* FiberHandle.run(handle, Effect.succeed("hello"))
 * 
 *   // Get the fiber (fails if no fiber)
 *   const fiber = yield* FiberHandle.get(handle)
 *   if (fiber) {
 *     const result = yield* Fiber.await(fiber)
 *     console.log(result) // "hello"
 *   }
 * })
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
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
const exportName = "get";
const exportKind = "function";
const moduleImportPath = "effect/FiberHandle";
const sourceSummary = "Retrieve the fiber from the FiberHandle.";
const sourceExample = "import { Effect, Fiber, FiberHandle } from \"effect\"\n\nEffect.gen(function*() {\n  const handle = yield* FiberHandle.make()\n\n  // Add a fiber\n  yield* FiberHandle.run(handle, Effect.succeed(\"hello\"))\n\n  // Get the fiber (fails if no fiber)\n  const fiber = yield* FiberHandle.get(handle)\n  if (fiber) {\n    const result = yield* Fiber.await(fiber)\n    console.log(result) // \"hello\"\n  }\n})";
const moduleRecord = FiberHandleModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleFunctionInvocation = Effect.gen(function* () {
  yield* Console.log("Execute a safe zero-arg invocation probe.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation
    }
  ]
});

BunRuntime.runMain(program);
