/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/PubSub
 * Export: isShutdownUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/PubSub.ts
 * Generated: 2026-02-19T04:14:15.991Z
 *
 * Overview:
 * Returns `true` if `shutdown` has been called, otherwise returns `false`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { PubSub } from "effect"
 * 
 * declare const pubsub: PubSub.PubSub<string>
 * 
 * // Unsafe synchronous shutdown check
 * const isDown = PubSub.isShutdownUnsafe(pubsub)
 * if (isDown) {
 *   console.log("PubSub is shutdown, cannot publish")
 * } else {
 *   console.log("PubSub is active")
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
const exportName = "isShutdownUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/PubSub";
const sourceSummary = "Returns `true` if `shutdown` has been called, otherwise returns `false`.";
const sourceExample = "import { PubSub } from \"effect\"\n\ndeclare const pubsub: PubSub.PubSub<string>\n\n// Unsafe synchronous shutdown check\nconst isDown = PubSub.isShutdownUnsafe(pubsub)\nif (isDown) {\n  console.log(\"PubSub is shutdown, cannot publish\")\n} else {\n  console.log(\"PubSub is active\")\n}";
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
