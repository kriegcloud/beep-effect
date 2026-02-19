/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: remainingUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:14:15.991Z
 *
 * Overview:
 * Returns the number of messages currently available in the subscription.
 *
 * Source JSDoc Example:
 * ```ts
 * import { PubSub } from "effect"
 * 
 * declare const subscription: PubSub.Subscription<string>
 * 
 * // Unsafe synchronous check for remaining messages
 * const remainingOption = PubSub.remainingUnsafe(subscription)
 * if (remainingOption) {
 *   console.log("Messages available:", remainingOption)
 * } else {
 *   console.log("Subscription is shutdown")
 * }
 * 
 * // Useful for polling or batching scenarios
 * if (remainingOption && remainingOption > 10) {
 *   // Process messages in batch
 * }
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
const exportName = "remainingUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/PubSub";
const sourceSummary = "Returns the number of messages currently available in the subscription.";
const sourceExample = "import { PubSub } from \"effect\"\n\ndeclare const subscription: PubSub.Subscription<string>\n\n// Unsafe synchronous check for remaining messages\nconst remainingOption = PubSub.remainingUnsafe(subscription)\nif (remainingOption) {\n  console.log(\"Messages available:\", remainingOption)\n} else {\n  console.log(\"Subscription is shutdown\")\n}\n\n// Useful for polling or batching scenarios\nif (remainingOption && remainingOption > 10) {\n  // Process messages in batch\n}";
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
