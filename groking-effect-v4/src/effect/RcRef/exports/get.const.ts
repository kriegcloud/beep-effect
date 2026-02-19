/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/RcRef
 * Export: get
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/RcRef.ts
 * Generated: 2026-02-19T04:14:16.245Z
 *
 * Overview:
 * Get the value from an RcRef.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, RcRef } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   // Create an RcRef with a resource
 *   const ref = yield* RcRef.make({
 *     acquire: Effect.acquireRelease(
 *       Effect.succeed("shared resource"),
 *       (resource) => Effect.log(`Releasing ${resource}`)
 *     )
 *   })
 * 
 *   // Get the value from the RcRef
 *   const value1 = yield* RcRef.get(ref)
 *   const value2 = yield* RcRef.get(ref)
 * 
 *   // Both values are the same instance
 *   console.log(value1 === value2) // true
 * 
 *   return value1
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
import * as RcRefModule from "effect/RcRef";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "get";
const exportKind = "const";
const moduleImportPath = "effect/RcRef";
const sourceSummary = "Get the value from an RcRef.";
const sourceExample = "import { Effect, RcRef } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  // Create an RcRef with a resource\n  const ref = yield* RcRef.make({\n    acquire: Effect.acquireRelease(\n      Effect.succeed(\"shared resource\"),\n      (resource) => Effect.log(`Releasing ${resource}`)\n    )\n  })\n\n  // Get the value from the RcRef\n  const value1 = yield* RcRef.get(ref)\n  const value2 = yield* RcRef.get(ref)\n\n  // Both values are the same instance\n  console.log(value1 === value2) // true\n\n  return value1\n})";
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
