/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: Subscription
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:50:38.432Z
 *
 * Overview:
 * A subscription represents a consumer's connection to a PubSub, allowing them to take messages.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   // Subscribe within a scope for automatic cleanup
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription: PubSub.Subscription<string> = yield* PubSub.subscribe(
 *       pubsub
 *     )
 *
 *     // Take individual messages
 *     const message = yield* PubSub.take(subscription)
 *
 *     // Take multiple messages
 *     const messages = yield* PubSub.takeUpTo(subscription, 5)
 *     const allMessages = yield* PubSub.takeAll(subscription)
 *   }))
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as PubSubModule from "effect/PubSub";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Subscription";
const exportKind = "interface";
const moduleImportPath = "effect/PubSub";
const sourceSummary = "A subscription represents a consumer's connection to a PubSub, allowing them to take messages.";
const sourceExample =
  'import { Effect } from "effect"\nimport * as PubSub from "effect/PubSub"\n\nconst program = Effect.gen(function*() {\n  const pubsub = yield* PubSub.bounded<string>(10)\n\n  // Subscribe within a scope for automatic cleanup\n  yield* Effect.scoped(Effect.gen(function*() {\n    const subscription: PubSub.Subscription<string> = yield* PubSub.subscribe(\n      pubsub\n    )\n\n    // Take individual messages\n    const message = yield* PubSub.take(subscription)\n\n    // Take multiple messages\n    const messages = yield* PubSub.takeUpTo(subscription, 5)\n    const allMessages = yield* PubSub.takeAll(subscription)\n  }))\n})';
const moduleRecord = PubSubModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
