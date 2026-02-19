/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Deferred
 * Export: interrupt
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Deferred.ts
 * Generated: 2026-02-19T04:14:11.285Z
 *
 * Overview:
 * Completes the `Deferred` with interruption. This will interrupt all fibers waiting on the value of the `Deferred` with the `FiberId` of the fiber calling this method.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Deferred, Effect } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   const success = yield* Deferred.interrupt(deferred)
 *   console.log(success) // true
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
import * as DeferredModule from "effect/Deferred";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "interrupt";
const exportKind = "const";
const moduleImportPath = "effect/Deferred";
const sourceSummary = "Completes the `Deferred` with interruption. This will interrupt all fibers waiting on the value of the `Deferred` with the `FiberId` of the fiber calling this method.";
const sourceExample = "import { Deferred, Effect } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const deferred = yield* Deferred.make<number>()\n  const success = yield* Deferred.interrupt(deferred)\n  console.log(success) // true\n})";
const moduleRecord = DeferredModule as Record<string, unknown>;

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
