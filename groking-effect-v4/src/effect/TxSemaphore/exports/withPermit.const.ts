/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxSemaphore
 * Export: withPermit
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxSemaphore.ts
 * Generated: 2026-02-19T04:14:23.495Z
 *
 * Overview:
 * Executes an effect with a single permit from the semaphore. The permit is automatically acquired before execution and released afterwards, even if the effect fails or is interrupted.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(2)
 * 
 *   // Execute database operation with automatic permit management
 *   const result = yield* TxSemaphore.withPermit(
 *     semaphore,
 *     Effect.gen(function*() {
 *       yield* Console.log("Permit acquired, accessing database...")
 *       yield* Effect.sleep("100 millis") // Simulate database work
 *       yield* Console.log("Database operation complete")
 *       return "query result"
 *     })
 *   )
 * 
 *   yield* Console.log(`Result: ${result}`)
 *   // Permit is automatically released here
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
import * as TxSemaphoreModule from "effect/TxSemaphore";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "withPermit";
const exportKind = "const";
const moduleImportPath = "effect/TxSemaphore";
const sourceSummary = "Executes an effect with a single permit from the semaphore. The permit is automatically acquired before execution and released afterwards, even if the effect fails or is interru...";
const sourceExample = "import { Console, Effect, TxSemaphore } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const semaphore = yield* TxSemaphore.make(2)\n\n  // Execute database operation with automatic permit management\n  const result = yield* TxSemaphore.withPermit(\n    semaphore,\n    Effect.gen(function*() {\n      yield* Console.log(\"Permit acquired, accessing database...\")\n      yield* Effect.sleep(\"100 millis\") // Simulate database work\n      yield* Console.log(\"Database operation complete\")\n      return \"query result\"\n    })\n  )\n\n  yield* Console.log(`Result: ${result}`)\n  // Permit is automatically released here\n})";
const moduleRecord = TxSemaphoreModule as Record<string, unknown>;

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
