/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: embedInput
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.636Z
 *
 * Overview:
 * Returns a new channel which embeds the given input handler into a Channel.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data, Effect } from "effect"
 * 
 * class EmbedError extends Data.TaggedError("EmbedError")<{
 *   readonly stage: string
 * }> {}
 * 
 * // Create a base channel
 * const baseChannel = Channel.fromIterable([1, 2, 3])
 * 
 * // Embed input handling - simplified example
 * const embeddedChannel = Channel.embedInput(
 *   baseChannel,
 *   (_upstream) => Effect.void
 * )
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
import * as ChannelModule from "effect/Channel";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "embedInput";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Returns a new channel which embeds the given input handler into a Channel.";
const sourceExample = "import { Channel, Data, Effect } from \"effect\"\n\nclass EmbedError extends Data.TaggedError(\"EmbedError\")<{\n  readonly stage: string\n}> {}\n\n// Create a base channel\nconst baseChannel = Channel.fromIterable([1, 2, 3])\n\n// Embed input handling - simplified example\nconst embeddedChannel = Channel.embedInput(\n  baseChannel,\n  (_upstream) => Effect.void\n)";
const moduleRecord = ChannelModule as Record<string, unknown>;

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
