/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: flip
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:14:16.771Z
 *
 * Overview:
 * Swaps the success and failure channels of a `Result`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 * 
 * console.log(Result.flip(Result.succeed(42)))
 * // Output: { _tag: "Failure", failure: 42, ... }
 * 
 * console.log(Result.flip(Result.fail("error")))
 * // Output: { _tag: "Success", success: "error", ... }
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
import * as ResultModule from "effect/Result";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "flip";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Swaps the success and failure channels of a `Result`.";
const sourceExample = "import { Result } from \"effect\"\n\nconsole.log(Result.flip(Result.succeed(42)))\n// Output: { _tag: \"Failure\", failure: 42, ... }\n\nconsole.log(Result.flip(Result.fail(\"error\")))\n// Output: { _tag: \"Success\", success: \"error\", ... }";
const moduleRecord = ResultModule as Record<string, unknown>;

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
