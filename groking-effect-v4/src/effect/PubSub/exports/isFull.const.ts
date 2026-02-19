/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: isFull
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:14:15.990Z
 *
 * Overview:
 * Returns `true` if the `PubSub` contains at least one element, `false` otherwise.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 * 
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(2)
 * 
 *   // Initially not full
 *   const initiallyFull = yield* PubSub.isFull(pubsub)
 *   console.log("Initially full:", initiallyFull) // false
 * 
 *   // Fill the PubSub
 *   yield* PubSub.publish(pubsub, "msg1")
 *   yield* PubSub.publish(pubsub, "msg2")
 * 
 *   const nowFull = yield* PubSub.isFull(pubsub)
 *   console.log("Now full:", nowFull) // true
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
import * as PubSubModule from "effect/PubSub";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isFull";
const exportKind = "const";
const moduleImportPath = "effect/PubSub";
const sourceSummary = "Returns `true` if the `PubSub` contains at least one element, `false` otherwise.";
const sourceExample = "import { Effect } from \"effect\"\nimport * as PubSub from \"effect/PubSub\"\n\nconst program = Effect.gen(function*() {\n  const pubsub = yield* PubSub.bounded<string>(2)\n\n  // Initially not full\n  const initiallyFull = yield* PubSub.isFull(pubsub)\n  console.log(\"Initially full:\", initiallyFull) // false\n\n  // Fill the PubSub\n  yield* PubSub.publish(pubsub, \"msg1\")\n  yield* PubSub.publish(pubsub, \"msg2\")\n\n  const nowFull = yield* PubSub.isFull(pubsub)\n  console.log(\"Now full:\", nowFull) // true\n})";
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
