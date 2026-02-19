/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: catchEager
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.386Z
 *
 * Overview:
 * An optimized version of `catch` that checks if an effect is already resolved and applies the catch function eagerly when possible.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * 
 * // For resolved failure effects, the catch function is applied immediately
 * const failed = Effect.fail("original error")
 * const recovered = Effect.catchEager(
 *   failed,
 *   (err: string) => Effect.succeed(`recovered from: ${err}`)
 * ) // Applied eagerly
 * 
 * // For success effects, returns success as-is
 * const success = Effect.succeed(42)
 * const unchanged = Effect.catchEager(
 *   success,
 *   (err: string) => Effect.succeed(`recovered from: ${err}`)
 * ) // Returns success as-is
 * 
 * // For pending effects, behaves like regular catch
 * const pending = Effect.delay(Effect.fail("error"), "100 millis")
 * const recoveredPending = Effect.catchEager(
 *   pending,
 *   (err: string) => Effect.succeed(`recovered from: ${err}`)
 * ) // Uses regular catch
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
import * as EffectModule from "effect/Effect";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "catchEager";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "An optimized version of `catch` that checks if an effect is already resolved and applies the catch function eagerly when possible.";
const sourceExample = "import { Effect } from \"effect\"\n\n// For resolved failure effects, the catch function is applied immediately\nconst failed = Effect.fail(\"original error\")\nconst recovered = Effect.catchEager(\n  failed,\n  (err: string) => Effect.succeed(`recovered from: ${err}`)\n) // Applied eagerly\n\n// For success effects, returns success as-is\nconst success = Effect.succeed(42)\nconst unchanged = Effect.catchEager(\n  success,\n  (err: string) => Effect.succeed(`recovered from: ${err}`)\n) // Returns success as-is\n\n// For pending effects, behaves like regular catch\nconst pending = Effect.delay(Effect.fail(\"error\"), \"100 millis\")\nconst recoveredPending = Effect.catchEager(\n  pending,\n  (err: string) => Effect.succeed(`recovered from: ${err}`)\n) // Uses regular catch";
const moduleRecord = EffectModule as Record<string, unknown>;

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
