/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: updateService
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.396Z
 *
 * Overview:
 * Updates the service with the required service entry.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, ServiceMap } from "effect"
 * 
 * // Define a counter service
 * const Counter = ServiceMap.Service<{ count: number }>("Counter")
 * 
 * const program = Effect.gen(function*() {
 *   const updatedCounter = yield* Effect.service(Counter)
 *   yield* Console.log(`Updated count: ${updatedCounter.count}`)
 *   return updatedCounter.count
 * }).pipe(
 *   Effect.updateService(Counter, (counter) => ({ count: counter.count + 1 }))
 * )
 * 
 * // Provide initial service and run
 * const result = Effect.provideService(program, Counter, { count: 0 })
 * Effect.runPromise(result).then(console.log)
 * // Output: Updated count: 1
 * // 1
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
import * as EffectModule from "effect/Effect";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "updateService";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Updates the service with the required service entry.";
const sourceExample = "import { Console, Effect, ServiceMap } from \"effect\"\n\n// Define a counter service\nconst Counter = ServiceMap.Service<{ count: number }>(\"Counter\")\n\nconst program = Effect.gen(function*() {\n  const updatedCounter = yield* Effect.service(Counter)\n  yield* Console.log(`Updated count: ${updatedCounter.count}`)\n  return updatedCounter.count\n}).pipe(\n  Effect.updateService(Counter, (counter) => ({ count: counter.count + 1 }))\n)\n\n// Provide initial service and run\nconst result = Effect.provideService(program, Counter, { count: 0 })\nEffect.runPromise(result).then(console.log)\n// Output: Updated count: 1\n// 1";
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
