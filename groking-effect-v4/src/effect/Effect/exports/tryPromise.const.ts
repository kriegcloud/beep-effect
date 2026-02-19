/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: tryPromise
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.916Z
 *
 * Overview:
 * Creates an `Effect` that represents an asynchronous computation that might fail.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const getTodo = (id: number) =>
 *   // Will catch any errors and propagate them as UnknownError
 *   Effect.tryPromise(() =>
 *     fetch(`https://jsonplaceholder.typicode.com/todos/${id}`)
 *   )
 *
 * //      ┌─── Effect<Response, UnknownError, never>
 * //      ▼
 * const program = getTodo(1)
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "tryPromise";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Creates an `Effect` that represents an asynchronous computation that might fail.";
const sourceExample =
  'import { Effect } from "effect"\n\nconst getTodo = (id: number) =>\n  // Will catch any errors and propagate them as UnknownError\n  Effect.tryPromise(() =>\n    fetch(`https://jsonplaceholder.typicode.com/todos/${id}`)\n  )\n\n//      ┌─── Effect<Response, UnknownError, never>\n//      ▼\nconst program = getTodo(1)';
const moduleRecord = EffectModule as Record<string, unknown>;

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
