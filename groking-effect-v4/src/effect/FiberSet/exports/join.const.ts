/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberSet
 * Export: join
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FiberSet.ts
 * Generated: 2026-02-19T04:50:36.413Z
 *
 * Overview:
 * Join all fibers in the FiberSet. If any of the Fiber's in the set terminate with a failure, the returned Effect will terminate with the first failure that occurred.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *   yield* FiberSet.add(set, Effect.runFork(Effect.fail("error")))
 *
 *   // parent fiber will fail with "error"
 *   yield* FiberSet.join(set)
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FiberSetModule from "effect/FiberSet";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "join";
const exportKind = "const";
const moduleImportPath = "effect/FiberSet";
const sourceSummary =
  "Join all fibers in the FiberSet. If any of the Fiber's in the set terminate with a failure, the returned Effect will terminate with the first failure that occurred.";
const sourceExample =
  'import { Effect, FiberSet } from "effect"\n\nEffect.gen(function*() {\n  const set = yield* FiberSet.make()\n  yield* FiberSet.add(set, Effect.runFork(Effect.fail("error")))\n\n  // parent fiber will fail with "error"\n  yield* FiberSet.join(set)\n})';
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
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
