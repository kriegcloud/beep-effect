/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberSet
 * Export: FiberSet
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/FiberSet.ts
 * Generated: 2026-02-19T04:14:13.217Z
 *
 * Overview:
 * A FiberSet is a collection of fibers that can be managed together. When the associated Scope is closed, all fibers in the set will be interrupted.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const set = yield* FiberSet.make<string, string>()
 *
 *   // Add fibers to the set
 *   yield* FiberSet.run(set, Effect.succeed("hello"))
 *   yield* FiberSet.run(set, Effect.succeed("world"))
 *
 *   // Wait for all fibers to complete
 *   yield* FiberSet.awaitEmpty(set)
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FiberSetModule from "effect/FiberSet";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "FiberSet";
const exportKind = "interface";
const moduleImportPath = "effect/FiberSet";
const sourceSummary =
  "A FiberSet is a collection of fibers that can be managed together. When the associated Scope is closed, all fibers in the set will be interrupted.";
const sourceExample =
  'import { Effect, FiberSet } from "effect"\n\nconst program = Effect.gen(function*() {\n  const set = yield* FiberSet.make<string, string>()\n\n  // Add fibers to the set\n  yield* FiberSet.run(set, Effect.succeed("hello"))\n  yield* FiberSet.run(set, Effect.succeed("world"))\n\n  // Wait for all fibers to complete\n  yield* FiberSet.awaitEmpty(set)\n})';
const moduleRecord = FiberSetModule as Record<string, unknown>;

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
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
