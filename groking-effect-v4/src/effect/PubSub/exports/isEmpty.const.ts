/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: isEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:14:15.990Z
 *
 * Overview:
 * Returns `true` if the `Pubsub` contains zero elements, `false` otherwise.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   // Initially empty
 *   const initiallyEmpty = yield* PubSub.isEmpty(pubsub)
 *   console.log("Initially empty:", initiallyEmpty) // true
 *
 *   // Publish a message
 *   yield* PubSub.publish(pubsub, "Hello")
 *
 *   const nowEmpty = yield* PubSub.isEmpty(pubsub)
 *   console.log("Now empty:", nowEmpty) // false
 * })
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
const exportName = "isEmpty";
const exportKind = "const";
const moduleImportPath = "effect/PubSub";
const sourceSummary = "Returns `true` if the `Pubsub` contains zero elements, `false` otherwise.";
const sourceExample =
  'import { Effect } from "effect"\nimport * as PubSub from "effect/PubSub"\n\nconst program = Effect.gen(function*() {\n  const pubsub = yield* PubSub.bounded<string>(10)\n\n  // Initially empty\n  const initiallyEmpty = yield* PubSub.isEmpty(pubsub)\n  console.log("Initially empty:", initiallyEmpty) // true\n\n  // Publish a message\n  yield* PubSub.publish(pubsub, "Hello")\n\n  const nowEmpty = yield* PubSub.isEmpty(pubsub)\n  console.log("Now empty:", nowEmpty) // false\n})';
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
