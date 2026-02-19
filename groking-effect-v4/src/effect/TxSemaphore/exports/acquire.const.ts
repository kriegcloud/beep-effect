/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxSemaphore
 * Export: acquire
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxSemaphore.ts
 * Generated: 2026-02-19T04:14:23.495Z
 *
 * Overview:
 * Acquires a single permit from the semaphore. If no permits are available, the effect will block until one becomes available.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(2)
 * 
 *   yield* Console.log("Acquiring first permit...")
 *   yield* TxSemaphore.acquire(semaphore)
 *   yield* Console.log("First permit acquired")
 * 
 *   yield* Console.log("Acquiring second permit...")
 *   yield* TxSemaphore.acquire(semaphore)
 *   yield* Console.log("Second permit acquired")
 * 
 *   const available = yield* TxSemaphore.available(semaphore)
 *   yield* Console.log(`Available permits: ${available}`) // 0
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
const exportName = "acquire";
const exportKind = "const";
const moduleImportPath = "effect/TxSemaphore";
const sourceSummary = "Acquires a single permit from the semaphore. If no permits are available, the effect will block until one becomes available.";
const sourceExample = "import { Console, Effect, TxSemaphore } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const semaphore = yield* TxSemaphore.make(2)\n\n  yield* Console.log(\"Acquiring first permit...\")\n  yield* TxSemaphore.acquire(semaphore)\n  yield* Console.log(\"First permit acquired\")\n\n  yield* Console.log(\"Acquiring second permit...\")\n  yield* TxSemaphore.acquire(semaphore)\n  yield* Console.log(\"Second permit acquired\")\n\n  const available = yield* TxSemaphore.available(semaphore)\n  yield* Console.log(`Available permits: ${available}`) // 0\n})";
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
