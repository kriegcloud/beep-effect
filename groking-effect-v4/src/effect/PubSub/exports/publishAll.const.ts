/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: publishAll
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:14:15.991Z
 *
 * Overview:
 * Publishes all of the specified messages to the `PubSub`, returning whether they were published to the `PubSub`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 * 
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 * 
 *   // Publish multiple messages at once
 *   const messages = ["Hello", "World", "from", "Effect"]
 *   const allPublished = yield* PubSub.publishAll(pubsub, messages)
 *   console.log("All messages published:", allPublished) // true
 * 
 *   // With a smaller capacity
 *   const smallPubsub = yield* PubSub.bounded<string>(2)
 *   const manyMessages = ["msg1", "msg2", "msg3", "msg4"]
 * 
 *   // Will suspend until space becomes available for all messages
 *   const publishAllEffect = PubSub.publishAll(smallPubsub, manyMessages)
 * 
 *   // Subscribe to consume messages and free space
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(smallPubsub)
 *     yield* PubSub.takeAll(subscription) // consume all messages
 *     const result = yield* publishAllEffect
 *     console.log("All messages eventually published:", result)
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
const exportName = "publishAll";
const exportKind = "const";
const moduleImportPath = "effect/PubSub";
const sourceSummary = "Publishes all of the specified messages to the `PubSub`, returning whether they were published to the `PubSub`.";
const sourceExample = "import { Effect } from \"effect\"\nimport * as PubSub from \"effect/PubSub\"\n\nconst program = Effect.gen(function*() {\n  const pubsub = yield* PubSub.bounded<string>(10)\n\n  // Publish multiple messages at once\n  const messages = [\"Hello\", \"World\", \"from\", \"Effect\"]\n  const allPublished = yield* PubSub.publishAll(pubsub, messages)\n  console.log(\"All messages published:\", allPublished) // true\n\n  // With a smaller capacity\n  const smallPubsub = yield* PubSub.bounded<string>(2)\n  const manyMessages = [\"msg1\", \"msg2\", \"msg3\", \"msg4\"]\n\n  // Will suspend until space becomes available for all messages\n  const publishAllEffect = PubSub.publishAll(smallPubsub, manyMessages)\n\n  // Subscribe to consume messages and free space\n  yield* Effect.scoped(Effect.gen(function*() {\n    const subscription = yield* PubSub.subscribe(smallPubsub)\n    yield* PubSub.takeAll(subscription) // consume all messages\n    const result = yield* publishAllEffect\n    console.log(\"All messages eventually published:\", result)\n  }))\n})";
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
