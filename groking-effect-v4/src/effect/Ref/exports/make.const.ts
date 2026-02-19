/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Ref
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Ref.ts
 * Generated: 2026-02-19T04:14:16.480Z
 *
 * Overview:
 * Creates a new Ref with the specified initial value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Ref } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const ref = yield* Ref.make(42)
 *   const value = yield* Ref.get(ref)
 *   console.log(value) // 42
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
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/Ref";
const sourceSummary = "Creates a new Ref with the specified initial value.";
const sourceExample = "import { Effect, Ref } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const ref = yield* Ref.make(42)\n  const value = yield* Ref.get(ref)\n  console.log(value) // 42\n})";
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
