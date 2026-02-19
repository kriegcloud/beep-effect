/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: PubSub
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:14:15.991Z
 *
 * Overview:
 * A `PubSub<A>` is an asynchronous message hub into which publishers can publish messages of type `A` and subscribers can subscribe to take messages of type `A`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 * 
 * const program = Effect.gen(function*() {
 *   // Create a bounded PubSub with capacity 10
 *   const pubsub = yield* PubSub.bounded<string>(10)
 * 
 *   // Publish messages
 *   yield* PubSub.publish(pubsub, "Hello")
 *   yield* PubSub.publish(pubsub, "World")
 * 
 *   // Subscribe and consume messages
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(pubsub)
 *     const message1 = yield* PubSub.take(subscription)
 *     const message2 = yield* PubSub.take(subscription)
 *     console.log(message1, message2) // "Hello", "World"
 *   }))
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as PubSubModule from "effect/PubSub";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "PubSub";
const exportKind = "interface";
const moduleImportPath = "effect/PubSub";
const sourceSummary = "A `PubSub<A>` is an asynchronous message hub into which publishers can publish messages of type `A` and subscribers can subscribe to take messages of type `A`.";
const sourceExample = "import { Effect } from \"effect\"\nimport * as PubSub from \"effect/PubSub\"\n\nconst program = Effect.gen(function*() {\n  // Create a bounded PubSub with capacity 10\n  const pubsub = yield* PubSub.bounded<string>(10)\n\n  // Publish messages\n  yield* PubSub.publish(pubsub, \"Hello\")\n  yield* PubSub.publish(pubsub, \"World\")\n\n  // Subscribe and consume messages\n  yield* Effect.scoped(Effect.gen(function*() {\n    const subscription = yield* PubSub.subscribe(pubsub)\n    const message1 = yield* PubSub.take(subscription)\n    const message2 = yield* PubSub.take(subscription)\n    console.log(message1, message2) // \"Hello\", \"World\"\n  }))\n})";
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
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
