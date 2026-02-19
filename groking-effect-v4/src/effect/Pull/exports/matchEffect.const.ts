/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Pull
 * Export: matchEffect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Pull.ts
 * Generated: 2026-02-19T04:14:16.003Z
 *
 * Overview:
 * Pattern matches on a Pull, handling success, failure, and done cases.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect, Pull } from "effect"
 * 
 * const pull = Cause.done("stream ended")
 * 
 * const result = Pull.matchEffect(pull, {
 *   onSuccess: (value) => Effect.succeed(`Got value: ${value}`),
 *   onFailure: (cause) => Effect.succeed(`Got error: ${cause}`),
 *   onDone: (leftover) => Effect.succeed(`Stream halted with: ${leftover}`)
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
import * as PullModule from "effect/Pull";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "matchEffect";
const exportKind = "const";
const moduleImportPath = "effect/Pull";
const sourceSummary = "Pattern matches on a Pull, handling success, failure, and done cases.";
const sourceExample = "import { Cause, Effect, Pull } from \"effect\"\n\nconst pull = Cause.done(\"stream ended\")\n\nconst result = Pull.matchEffect(pull, {\n  onSuccess: (value) => Effect.succeed(`Got value: ${value}`),\n  onFailure: (cause) => Effect.succeed(`Got error: ${cause}`),\n  onDone: (leftover) => Effect.succeed(`Stream halted with: ${leftover}`)\n})";
const moduleRecord = PullModule as Record<string, unknown>;

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
