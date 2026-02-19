/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Ref
 * Export: modifySome
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Ref.ts
 * Generated: 2026-02-19T04:14:16.480Z
 *
 * Overview:
 * Atomically modifies the value of the Ref using the given partial function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Ref } from "effect"
 * import * as Option from "effect/Option"
 * 
 * const program = Effect.gen(function*() {
 *   const counter = yield* Ref.make(5)
 * 
 *   // Only modify if value is greater than 3
 *   const result1 = yield* Ref.modifySome(
 *     counter,
 *     (n) =>
 *       n > 3
 *         ? [`incremented ${n}`, Option.some(n + 10)]
 *         : ["no change", Option.none()]
 *   )
 * 
 *   console.log(result1) // "incremented 5"
 * 
 *   const current1 = yield* Ref.get(counter)
 *   console.log(current1) // 15
 * 
 *   // Try to modify with a condition that fails
 *   const result2 = yield* Ref.modifySome(
 *     counter,
 *     (n) =>
 *       n < 10
 *         ? [`decremented ${n}`, Option.some(n - 5)]
 *         : ["no change", Option.none()]
 *   )
 * 
 *   console.log(result2) // "no change"
 * 
 *   const current2 = yield* Ref.get(counter)
 *   console.log(current2) // 15 (unchanged)
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
import * as RefModule from "effect/Ref";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "modifySome";
const exportKind = "const";
const moduleImportPath = "effect/Ref";
const sourceSummary = "Atomically modifies the value of the Ref using the given partial function.";
const sourceExample = "import { Effect, Ref } from \"effect\"\nimport * as Option from \"effect/Option\"\n\nconst program = Effect.gen(function*() {\n  const counter = yield* Ref.make(5)\n\n  // Only modify if value is greater than 3\n  const result1 = yield* Ref.modifySome(\n    counter,\n    (n) =>\n      n > 3\n        ? [`incremented ${n}`, Option.some(n + 10)]\n        : [\"no change\", Option.none()]\n  )\n\n  console.log(result1) // \"incremented 5\"\n\n  const current1 = yield* Ref.get(counter)\n  console.log(current1) // 15\n\n  // Try to modify with a condition that fails\n  const result2 = yield* Ref.modifySome(\n    counter,\n    (n) =>\n      n < 10\n        ? [`decremented ${n}`, Option.some(n - 5)]\n        : [\"no change\", Option.none()]\n  )\n\n  console.log(result2) // \"no change\"\n\n  const current2 = yield* Ref.get(counter)\n  console.log(current2) // 15 (unchanged)\n})";
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
