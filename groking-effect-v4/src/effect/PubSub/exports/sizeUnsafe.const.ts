/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: sizeUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:14:15.991Z
 *
 * Overview:
 * Retrieves the size of the queue, which is equal to the number of elements in the queue. This may be negative if fibers are suspended waiting for elements to be added to the queue.
 *
 * Source JSDoc Example:
 * ```ts
 * import { PubSub } from "effect"
 *
 * // Unsafe synchronous size check
 * declare const pubsub: PubSub.PubSub<string>
 *
 * const size = PubSub.sizeUnsafe(pubsub)
 * console.log("Current size:", size)
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as PubSubModule from "effect/PubSub";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "sizeUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/PubSub";
const sourceSummary =
  "Retrieves the size of the queue, which is equal to the number of elements in the queue. This may be negative if fibers are suspended waiting for elements to be added to the queue.";
const sourceExample =
  'import { PubSub } from "effect"\n\n// Unsafe synchronous size check\ndeclare const pubsub: PubSub.PubSub<string>\n\nconst size = PubSub.sizeUnsafe(pubsub)\nconsole.log("Current size:", size)';
const moduleRecord = PubSubModule as Record<string, unknown>;

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
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
