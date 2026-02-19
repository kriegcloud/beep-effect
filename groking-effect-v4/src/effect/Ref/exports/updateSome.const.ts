/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Ref
 * Export: updateSome
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Ref.ts
 * Generated: 2026-02-19T04:14:16.481Z
 *
 * Overview:
 * Atomically updates the value of the Ref using the given partial function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Ref } from "effect"
 * import * as Option from "effect/Option"
 * 
 * const program = Effect.gen(function*() {
 *   const counter = yield* Ref.make(5)
 * 
 *   // Only update if value is even
 *   yield* Ref.updateSome(
 *     counter,
 *     (n) => n % 2 === 0 ? Option.some(n * 2) : Option.none()
 *   )
 * 
 *   let current = yield* Ref.get(counter)
 *   console.log(current) // 5 (unchanged because 5 is odd)
 * 
 *   // Set to even number and try again
 *   yield* Ref.set(counter, 6)
 *   yield* Ref.updateSome(
 *     counter,
 *     (n) => n % 2 === 0 ? Option.some(n * 2) : Option.none()
 *   )
 * 
 *   current = yield* Ref.get(counter)
 *   console.log(current) // 12 (updated because 6 is even)
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
const exportName = "updateSome";
const exportKind = "const";
const moduleImportPath = "effect/Ref";
const sourceSummary = "Atomically updates the value of the Ref using the given partial function.";
const sourceExample = "import { Effect, Ref } from \"effect\"\nimport * as Option from \"effect/Option\"\n\nconst program = Effect.gen(function*() {\n  const counter = yield* Ref.make(5)\n\n  // Only update if value is even\n  yield* Ref.updateSome(\n    counter,\n    (n) => n % 2 === 0 ? Option.some(n * 2) : Option.none()\n  )\n\n  let current = yield* Ref.get(counter)\n  console.log(current) // 5 (unchanged because 5 is odd)\n\n  // Set to even number and try again\n  yield* Ref.set(counter, 6)\n  yield* Ref.updateSome(\n    counter,\n    (n) => n % 2 === 0 ? Option.some(n * 2) : Option.none()\n  )\n\n  current = yield* Ref.get(counter)\n  console.log(current) // 12 (updated because 6 is even)\n})";
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
