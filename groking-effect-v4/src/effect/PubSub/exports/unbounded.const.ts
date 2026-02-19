/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: unbounded
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:14:15.992Z
 *
 * Overview:
 * Creates an unbounded `PubSub`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   // Create unbounded PubSub
 *   const pubsub = yield* PubSub.unbounded<string>()
 *
 *   // With replay buffer for late subscribers
 *   const pubsubWithReplay = yield* PubSub.unbounded<string>({
 *     replay: 10
 *   })
 *
 *   // Can publish unlimited messages
 *   for (let i = 0; i < 1000; i++) {
 *     yield* PubSub.publish(pubsub, `message-${i}`)
 *   }
 *
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(pubsub)
 *     const message = yield* PubSub.take(subscription)
 *     console.log("First message:", message)
 *   }))
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
const exportName = "unbounded";
const exportKind = "const";
const moduleImportPath = "effect/PubSub";
const sourceSummary = "Creates an unbounded `PubSub`.";
const sourceExample =
  'import { Effect } from "effect"\nimport * as PubSub from "effect/PubSub"\n\nconst program = Effect.gen(function*() {\n  // Create unbounded PubSub\n  const pubsub = yield* PubSub.unbounded<string>()\n\n  // With replay buffer for late subscribers\n  const pubsubWithReplay = yield* PubSub.unbounded<string>({\n    replay: 10\n  })\n\n  // Can publish unlimited messages\n  for (let i = 0; i < 1000; i++) {\n    yield* PubSub.publish(pubsub, `message-${i}`)\n  }\n\n  yield* Effect.scoped(Effect.gen(function*() {\n    const subscription = yield* PubSub.subscribe(pubsub)\n    const message = yield* PubSub.take(subscription)\n    console.log("First message:", message)\n  }))\n})';
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
