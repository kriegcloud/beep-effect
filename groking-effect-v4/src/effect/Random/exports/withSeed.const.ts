/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Random
 * Export: withSeed
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Random.ts
 * Generated: 2026-02-19T04:14:16.224Z
 *
 * Overview:
 * Seeds the pseudorandom number generator with the specified value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Random } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const value1 = yield* Random.next
 *   const value2 = yield* Random.next
 *   console.log(value1, value2)
 * })
 * 
 * // Same seed produces same sequence
 * const seeded1 = program.pipe(Random.withSeed("my-seed"))
 * const seeded2 = program.pipe(Random.withSeed("my-seed"))
 * 
 * // Both will output identical values
 * Effect.runPromise(seeded1)
 * Effect.runPromise(seeded2)
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
import * as RandomModule from "effect/Random";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "withSeed";
const exportKind = "const";
const moduleImportPath = "effect/Random";
const sourceSummary = "Seeds the pseudorandom number generator with the specified value.";
const sourceExample = "import { Effect, Random } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const value1 = yield* Random.next\n  const value2 = yield* Random.next\n  console.log(value1, value2)\n})\n\n// Same seed produces same sequence\nconst seeded1 = program.pipe(Random.withSeed(\"my-seed\"))\nconst seeded2 = program.pipe(Random.withSeed(\"my-seed\"))\n\n// Both will output identical values\nEffect.runPromise(seeded1)\nEffect.runPromise(seeded2)";
const moduleRecord = RandomModule as Record<string, unknown>;

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
