/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Ref
 * Export: getAndUpdateSome
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Ref.ts
 * Generated: 2026-02-19T04:50:38.751Z
 *
 * Overview:
 * Atomically gets the current value of the Ref and updates it with the given partial function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Ref } from "effect"
 * import * as Option from "effect/Option"
 *
 * const program = Effect.gen(function*() {
 *   const counter = yield* Ref.make(5)
 *
 *   // Only update if value is greater than 3
 *   const previous1 = yield* Ref.getAndUpdateSome(
 *     counter,
 *     (n) => n > 3 ? Option.some(n * 2) : Option.none()
 *   )
 *   console.log(previous1) // 5
 *
 *   const current1 = yield* Ref.get(counter)
 *   console.log(current1) // 10
 *
 *   // Try to update again (won't update since 10 > 3 is true but let's say condition is n < 3)
 *   const previous2 = yield* Ref.getAndUpdateSome(
 *     counter,
 *     (n) => n < 3 ? Option.some(n * 2) : Option.none()
 *   )
 *   console.log(previous2) // 10
 *
 *   const current2 = yield* Ref.get(counter)
 *   console.log(current2) // 10 (unchanged)
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
const exportName = "getAndUpdateSome";
const exportKind = "const";
const moduleImportPath = "effect/Ref";
const sourceSummary = "Atomically gets the current value of the Ref and updates it with the given partial function.";
const sourceExample =
  'import { Effect, Ref } from "effect"\nimport * as Option from "effect/Option"\n\nconst program = Effect.gen(function*() {\n  const counter = yield* Ref.make(5)\n\n  // Only update if value is greater than 3\n  const previous1 = yield* Ref.getAndUpdateSome(\n    counter,\n    (n) => n > 3 ? Option.some(n * 2) : Option.none()\n  )\n  console.log(previous1) // 5\n\n  const current1 = yield* Ref.get(counter)\n  console.log(current1) // 10\n\n  // Try to update again (won\'t update since 10 > 3 is true but let\'s say condition is n < 3)\n  const previous2 = yield* Ref.getAndUpdateSome(\n    counter,\n    (n) => n < 3 ? Option.some(n * 2) : Option.none()\n  )\n  console.log(previous2) // 10\n\n  const current2 = yield* Ref.get(counter)\n  console.log(current2) // 10 (unchanged)\n})';
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
