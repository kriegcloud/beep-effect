/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Filter
 * Export: makeEffect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Filter.ts
 * Generated: 2026-02-19T04:50:36.481Z
 *
 * Overview:
 * Creates an effectful Filter from a function that returns an Effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Filter, Result } from "effect"
 *
 * // Create an effectful filter that validates async
 * const asyncValidate = Filter.makeEffect((id: string) =>
 *   Effect.gen(function*() {
 *     const isValid = yield* Effect.succeed(id.length > 0)
 *     return isValid ? Result.succeed(id) : Result.fail(id)
 *   })
 * )
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
import * as FilterModule from "effect/Filter";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeEffect";
const exportKind = "const";
const moduleImportPath = "effect/Filter";
const sourceSummary = "Creates an effectful Filter from a function that returns an Effect.";
const sourceExample =
  'import { Effect, Filter, Result } from "effect"\n\n// Create an effectful filter that validates async\nconst asyncValidate = Filter.makeEffect((id: string) =>\n  Effect.gen(function*() {\n    const isValid = yield* Effect.succeed(id.length > 0)\n    return isValid ? Result.succeed(id) : Result.fail(id)\n  })\n)';
const moduleRecord = FilterModule as Record<string, unknown>;

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
