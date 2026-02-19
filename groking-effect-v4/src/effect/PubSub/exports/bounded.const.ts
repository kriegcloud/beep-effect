/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: bounded
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:14:15.990Z
 *
 * Overview:
 * Creates a bounded PubSub with backpressure strategy.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 * 
 * const program = Effect.gen(function*() {
 *   // Create bounded PubSub with capacity 100
 *   const pubsub = yield* PubSub.bounded<string>(100)
 * 
 *   // Create with replay buffer for late subscribers
 *   const pubsubWithReplay = yield* PubSub.bounded<string>({
 *     capacity: 100,
 *     replay: 10 // Last 10 messages replayed to new subscribers
 *   })
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
const exportName = "bounded";
const exportKind = "const";
const moduleImportPath = "effect/PubSub";
const sourceSummary = "Creates a bounded PubSub with backpressure strategy.";
const sourceExample = "import { Effect } from \"effect\"\nimport * as PubSub from \"effect/PubSub\"\n\nconst program = Effect.gen(function*() {\n  // Create bounded PubSub with capacity 100\n  const pubsub = yield* PubSub.bounded<string>(100)\n\n  // Create with replay buffer for late subscribers\n  const pubsubWithReplay = yield* PubSub.bounded<string>({\n    capacity: 100,\n    replay: 10 // Last 10 messages replayed to new subscribers\n  })\n})";
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
