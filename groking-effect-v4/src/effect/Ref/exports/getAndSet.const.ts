/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Ref
 * Export: getAndSet
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Ref.ts
 * Generated: 2026-02-19T04:14:16.480Z
 *
 * Overview:
 * Atomically gets the current value of the Ref and sets it to the specified value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Ref } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const ref = yield* Ref.make("initial")
 * 
 *   // Get current value and set new value atomically
 *   const previous = yield* Ref.getAndSet(ref, "updated")
 *   console.log(previous) // "initial"
 * 
 *   const current = yield* Ref.get(ref)
 *   console.log(current) // "updated"
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
const exportName = "getAndSet";
const exportKind = "const";
const moduleImportPath = "effect/Ref";
const sourceSummary = "Atomically gets the current value of the Ref and sets it to the specified value.";
const sourceExample = "import { Effect, Ref } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const ref = yield* Ref.make(\"initial\")\n\n  // Get current value and set new value atomically\n  const previous = yield* Ref.getAndSet(ref, \"updated\")\n  console.log(previous) // \"initial\"\n\n  const current = yield* Ref.get(ref)\n  console.log(current) // \"updated\"\n})";
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
