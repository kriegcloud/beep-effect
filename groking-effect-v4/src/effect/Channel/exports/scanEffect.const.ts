/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Channel
 * Export: scanEffect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Channel.ts
 * Generated: 2026-02-19T04:14:10.641Z
 *
 * Overview:
 * Statefully transforms a channel by scanning over its output with an effectful accumulator function. Emits the intermediate results of the scan operation.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Channel, Data, Effect } from "effect"
 * 
 * class ScanError extends Data.TaggedError("ScanError")<{
 *   readonly reason: string
 * }> {}
 * 
 * // Create a channel with numbers
 * const numbersChannel = Channel.fromIterable([1, 2, 3, 4])
 * 
 * // Effectful scan with async operations
 * const asyncScanChannel = Channel.scanEffect(
 *   numbersChannel,
 *   "",
 *   (acc, value) =>
 *     Effect.gen(function*() {
 *       // Simulate async work
 *       yield* Effect.sleep("10 millis")
 *       return acc + value.toString()
 *     })
 * )
 * // Outputs: "", "1", "12", "123", "1234"
 * 
 * // Scan with error handling
 * const errorHandlingScan = Channel.scanEffect(
 *   numbersChannel,
 *   0,
 *   (sum, n) => {
 *     if (n < 0) {
 *       return Effect.fail(new ScanError({ reason: "negative number" }))
 *     }
 *     return Effect.succeed(sum + n)
 *   }
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
const exportName = "scanEffect";
const exportKind = "const";
const moduleImportPath = "effect/Channel";
const sourceSummary = "Statefully transforms a channel by scanning over its output with an effectful accumulator function. Emits the intermediate results of the scan operation.";
const sourceExample = "import { Channel, Data, Effect } from \"effect\"\n\nclass ScanError extends Data.TaggedError(\"ScanError\")<{\n  readonly reason: string\n}> {}\n\n// Create a channel with numbers\nconst numbersChannel = Channel.fromIterable([1, 2, 3, 4])\n\n// Effectful scan with async operations\nconst asyncScanChannel = Channel.scanEffect(\n  numbersChannel,\n  \"\",\n  (acc, value) =>\n    Effect.gen(function*() {\n      // Simulate async work\n      yield* Effect.sleep(\"10 millis\")\n      return acc + value.toString()\n    })\n)\n// Outputs: \"\", \"1\", \"12\", \"123\", \"1234\"\n\n// Scan with error handling\nconst errorHandlingScan = Channel.scanEffect(\n  numbersChannel,\n  0,\n  (sum, n) => {\n    if (n < 0) {\n      return Effect.fail(new ScanError({ reason: \"negative number\" }))\n    }\n    return Effect.succeed(sum + n)\n  }\n)";
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
