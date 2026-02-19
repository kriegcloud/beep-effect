/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxSemaphore
 * Export: releaseN
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxSemaphore.ts
 * Generated: 2026-02-19T04:14:23.495Z
 *
 * Overview:
 * Releases the specified number of permits back to the semaphore.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(5)
 * 
 *   // Acquire 3 permits
 *   yield* TxSemaphore.acquireN(semaphore, 3)
 *   let available = yield* TxSemaphore.available(semaphore)
 *   yield* Console.log(`After acquire: ${available}`) // 2
 * 
 *   // Release 2 permits
 *   yield* TxSemaphore.releaseN(semaphore, 2)
 *   available = yield* TxSemaphore.available(semaphore)
 *   yield* Console.log(`After release: ${available}`) // 4
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
const exportName = "releaseN";
const exportKind = "const";
const moduleImportPath = "effect/TxSemaphore";
const sourceSummary = "Releases the specified number of permits back to the semaphore.";
const sourceExample = "import { Console, Effect, TxSemaphore } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const semaphore = yield* TxSemaphore.make(5)\n\n  // Acquire 3 permits\n  yield* TxSemaphore.acquireN(semaphore, 3)\n  let available = yield* TxSemaphore.available(semaphore)\n  yield* Console.log(`After acquire: ${available}`) // 2\n\n  // Release 2 permits\n  yield* TxSemaphore.releaseN(semaphore, 2)\n  available = yield* TxSemaphore.available(semaphore)\n  yield* Console.log(`After release: ${available}`) // 4\n})";
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
