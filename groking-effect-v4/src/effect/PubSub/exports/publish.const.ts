/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: publish
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:14:15.991Z
 *
 * Overview:
 * Publishes a message to the `PubSub`, returning whether the message was published to the `PubSub`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 * 
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 * 
 *   // Publish a message
 *   const published = yield* PubSub.publish(pubsub, "Hello World")
 *   console.log("Message published:", published) // true
 * 
 *   // With a full bounded PubSub using backpressure strategy
 *   const smallPubsub = yield* PubSub.bounded<string>(1)
 *   yield* PubSub.publish(smallPubsub, "msg1") // succeeds
 * 
 *   // This will suspend until space becomes available
 *   const publishEffect = PubSub.publish(smallPubsub, "msg2")
 * 
 *   // Create a subscriber to free up space
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(smallPubsub)
 *     yield* PubSub.take(subscription) // frees space
 *     const result = yield* publishEffect
 *     console.log("Second message published:", result) // true
 *   }))
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
const exportName = "publish";
const exportKind = "const";
const moduleImportPath = "effect/PubSub";
const sourceSummary = "Publishes a message to the `PubSub`, returning whether the message was published to the `PubSub`.";
const sourceExample = "import { Effect } from \"effect\"\nimport * as PubSub from \"effect/PubSub\"\n\nconst program = Effect.gen(function*() {\n  const pubsub = yield* PubSub.bounded<string>(10)\n\n  // Publish a message\n  const published = yield* PubSub.publish(pubsub, \"Hello World\")\n  console.log(\"Message published:\", published) // true\n\n  // With a full bounded PubSub using backpressure strategy\n  const smallPubsub = yield* PubSub.bounded<string>(1)\n  yield* PubSub.publish(smallPubsub, \"msg1\") // succeeds\n\n  // This will suspend until space becomes available\n  const publishEffect = PubSub.publish(smallPubsub, \"msg2\")\n\n  // Create a subscriber to free up space\n  yield* Effect.scoped(Effect.gen(function*() {\n    const subscription = yield* PubSub.subscribe(smallPubsub)\n    yield* PubSub.take(subscription) // frees space\n    const result = yield* publishEffect\n    console.log(\"Second message published:\", result) // true\n  }))\n})";
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
