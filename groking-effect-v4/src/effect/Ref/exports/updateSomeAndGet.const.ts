/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Ref
 * Export: updateSomeAndGet
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Ref.ts
 * Generated: 2026-02-19T04:14:16.481Z
 *
 * Overview:
 * Atomically updates the value of the Ref using the given partial function and returns the current value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Ref } from "effect"
 * import * as Option from "effect/Option"
 *
 * const program = Effect.gen(function*() {
 *   const counter = yield* Ref.make(10)
 *
 *   // Only update if value is greater than 5
 *   const result1 = yield* Ref.updateSomeAndGet(
 *     counter,
 *     (n) => n > 5 ? Option.some(n / 2) : Option.none()
 *   )
 *   console.log(result1) // 5 (updated and returned)
 *
 *   // Try to update again with same condition
 *   const result2 = yield* Ref.updateSomeAndGet(
 *     counter,
 *     (n) => n > 5 ? Option.some(n / 2) : Option.none()
 *   )
 *   console.log(result2) // 5 (unchanged because 5 is not > 5)
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
import * as RefModule from "effect/Ref";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "updateSomeAndGet";
const exportKind = "const";
const moduleImportPath = "effect/Ref";
const sourceSummary =
  "Atomically updates the value of the Ref using the given partial function and returns the current value.";
const sourceExample =
  'import { Effect, Ref } from "effect"\nimport * as Option from "effect/Option"\n\nconst program = Effect.gen(function*() {\n  const counter = yield* Ref.make(10)\n\n  // Only update if value is greater than 5\n  const result1 = yield* Ref.updateSomeAndGet(\n    counter,\n    (n) => n > 5 ? Option.some(n / 2) : Option.none()\n  )\n  console.log(result1) // 5 (updated and returned)\n\n  // Try to update again with same condition\n  const result2 = yield* Ref.updateSomeAndGet(\n    counter,\n    (n) => n > 5 ? Option.some(n / 2) : Option.none()\n  )\n  console.log(result2) // 5 (unchanged because 5 is not > 5)\n})';
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
