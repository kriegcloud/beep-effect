/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: transposeOption
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.942Z
 *
 * Overview:
 * Transforms `Option<Result<A, E>>` into `Result<Option<A>, E>`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, Result } from "effect"
 *
 * const some = Option.some(Result.succeed(42))
 * console.log(Result.transposeOption(some))
 * // Output: { _tag: "Success", success: { _tag: "Some", value: 42 }, ... }
 *
 * const none = Option.none<Result.Result<number, string>>()
 * console.log(Result.transposeOption(none))
 * // Output: { _tag: "Success", success: { _tag: "None" }, ... }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "transposeOption";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Transforms `Option<Result<A, E>>` into `Result<Option<A>, E>`.";
const sourceExample =
  'import { Option, Result } from "effect"\n\nconst some = Option.some(Result.succeed(42))\nconsole.log(Result.transposeOption(some))\n// Output: { _tag: "Success", success: { _tag: "Some", value: 42 }, ... }\n\nconst none = Option.none<Result.Result<number, string>>()\nconsole.log(Result.transposeOption(none))\n// Output: { _tag: "Success", success: { _tag: "None" }, ... }';
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
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
