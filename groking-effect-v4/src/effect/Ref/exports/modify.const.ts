/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Ref
 * Export: modify
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Ref.ts
 * Generated: 2026-02-19T04:50:38.751Z
 *
 * Overview:
 * Atomically modifies the value of the Ref using the given function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Ref } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const counter = yield* Ref.make(10)
 *
 *   // Modify the ref and return some computation result
 *   const result = yield* Ref.modify(counter, (n) => [
 *     `Previous value was ${n}`, // Return value
 *     n * 2 // New ref value
 *   ])
 *
 *   console.log(result) // "Previous value was 10"
 *
 *   const current = yield* Ref.get(counter)
 *   console.log(current) // 20
 * })
 *
 * // Example with more complex computation
 * const program2 = Effect.gen(function*() {
 *   const state = yield* Ref.make({ count: 0, total: 0 })
 *
 *   const incremented = yield* Ref.modify(state, (s) => [
 *     s.count, // Return previous count
 *     { count: s.count + 1, total: s.total + s.count + 1 } // New state
 *   ])
 *
 *   console.log(incremented) // 0
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
import * as RefModule from "effect/Ref";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "modify";
const exportKind = "const";
const moduleImportPath = "effect/Ref";
const sourceSummary = "Atomically modifies the value of the Ref using the given function.";
const sourceExample =
  'import { Effect, Ref } from "effect"\n\nconst program = Effect.gen(function*() {\n  const counter = yield* Ref.make(10)\n\n  // Modify the ref and return some computation result\n  const result = yield* Ref.modify(counter, (n) => [\n    `Previous value was ${n}`, // Return value\n    n * 2 // New ref value\n  ])\n\n  console.log(result) // "Previous value was 10"\n\n  const current = yield* Ref.get(counter)\n  console.log(current) // 20\n})\n\n// Example with more complex computation\nconst program2 = Effect.gen(function*() {\n  const state = yield* Ref.make({ count: 0, total: 0 })\n\n  const incremented = yield* Ref.modify(state, (s) => [\n    s.count, // Return previous count\n    { count: s.count + 1, total: s.total + s.count + 1 } // New state\n  ])\n\n  console.log(incremented) // 0\n})';
const moduleRecord = RefModule as Record<string, unknown>;

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
