/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RcRef
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RcRef.ts
 * Generated: 2026-02-19T04:14:16.245Z
 *
 * Overview:
 * Create an `RcRef` from an acquire `Effect`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, RcRef } from "effect"
 *
 * Effect.gen(function*() {
 *   const ref = yield* RcRef.make({
 *     acquire: Effect.acquireRelease(
 *       Effect.succeed("foo"),
 *       () => Effect.log("release foo")
 *     )
 *   })
 *
 *   // will only acquire the resource once, and release it
 *   // when the scope is closed
 *   yield* RcRef.get(ref).pipe(
 *     Effect.andThen(RcRef.get(ref)),
 *     Effect.scoped
 *   )
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as RcRefModule from "effect/RcRef";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/RcRef";
const sourceSummary = "Create an `RcRef` from an acquire `Effect`.";
const sourceExample =
  'import { Effect, RcRef } from "effect"\n\nEffect.gen(function*() {\n  const ref = yield* RcRef.make({\n    acquire: Effect.acquireRelease(\n      Effect.succeed("foo"),\n      () => Effect.log("release foo")\n    )\n  })\n\n  // will only acquire the resource once, and release it\n  // when the scope is closed\n  yield* RcRef.get(ref).pipe(\n    Effect.andThen(RcRef.get(ref)),\n    Effect.scoped\n  )\n})';
const moduleRecord = RcRefModule as Record<string, unknown>;

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
