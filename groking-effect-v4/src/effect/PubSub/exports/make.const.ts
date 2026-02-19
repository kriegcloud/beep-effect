/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:14:15.991Z
 *
 * Overview:
 * Creates a PubSub with a custom atomic implementation and strategy.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 * 
 * const program = Effect.gen(function*() {
 *   // Create custom PubSub with specific atomic implementation and strategy
 *   const pubsub = yield* PubSub.make<string>({
 *     atomicPubSub: () => PubSub.makeAtomicBounded(100),
 *     strategy: () => new PubSub.BackPressureStrategy()
 *   })
 * 
 *   // Use the created PubSub
 *   yield* PubSub.publish(pubsub, "Hello")
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
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/PubSub";
const sourceSummary = "Creates a PubSub with a custom atomic implementation and strategy.";
const sourceExample = "import { Effect } from \"effect\"\nimport * as PubSub from \"effect/PubSub\"\n\nconst program = Effect.gen(function*() {\n  // Create custom PubSub with specific atomic implementation and strategy\n  const pubsub = yield* PubSub.make<string>({\n    atomicPubSub: () => PubSub.makeAtomicBounded(100),\n    strategy: () => new PubSub.BackPressureStrategy()\n  })\n\n  // Use the created PubSub\n  yield* PubSub.publish(pubsub, \"Hello\")\n})";
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
