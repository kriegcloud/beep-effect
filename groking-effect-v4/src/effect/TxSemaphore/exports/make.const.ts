/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxSemaphore
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxSemaphore.ts
 * Generated: 2026-02-19T04:14:23.495Z
 *
 * Overview:
 * Creates a new TxSemaphore with the specified number of permits.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 * 
 * // Create a semaphore for managing concurrent access to a resource pool
 * const program = Effect.gen(function*() {
 *   // Create a semaphore with 3 permits for a connection pool
 *   const connectionSemaphore = yield* TxSemaphore.make(3)
 * 
 *   // Check initial state
 *   const available = yield* TxSemaphore.available(connectionSemaphore)
 *   const capacity = yield* TxSemaphore.capacity(connectionSemaphore)
 * 
 *   yield* Console.log(
 *     `Created semaphore with ${capacity} permits, ${available} available`
 *   )
 *   // Output: "Created semaphore with 3 permits, 3 available"
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
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/TxSemaphore";
const sourceSummary = "Creates a new TxSemaphore with the specified number of permits.";
const sourceExample = "import { Console, Effect, TxSemaphore } from \"effect\"\n\n// Create a semaphore for managing concurrent access to a resource pool\nconst program = Effect.gen(function*() {\n  // Create a semaphore with 3 permits for a connection pool\n  const connectionSemaphore = yield* TxSemaphore.make(3)\n\n  // Check initial state\n  const available = yield* TxSemaphore.available(connectionSemaphore)\n  const capacity = yield* TxSemaphore.capacity(connectionSemaphore)\n\n  yield* Console.log(\n    `Created semaphore with ${capacity} permits, ${available} available`\n  )\n  // Output: \"Created semaphore with 3 permits, 3 available\"\n})";
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
