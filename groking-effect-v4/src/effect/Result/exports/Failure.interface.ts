/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: Failure
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:14:16.771Z
 *
 * Overview:
 * The failure variant of {@link Result}. Wraps an error of type `E`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 * 
 * const failure = Result.fail("Network error")
 * 
 * if (Result.isFailure(failure)) {
 *   console.log(failure.failure)
 *   // Output: "Network error"
 * }
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
import * as ResultModule from "effect/Result";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Failure";
const exportKind = "interface";
const moduleImportPath = "effect/Result";
const sourceSummary = "The failure variant of {@link Result}. Wraps an error of type `E`.";
const sourceExample = "import { Result } from \"effect\"\n\nconst failure = Result.fail(\"Network error\")\n\nif (Result.isFailure(failure)) {\n  console.log(failure.failure)\n  // Output: \"Network error\"\n}";
const moduleRecord = ResultModule as Record<string, unknown>;

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
