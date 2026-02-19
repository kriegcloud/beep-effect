/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: fromOption
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:14:16.771Z
 *
 * Overview:
 * Converts an `Option<A>` into a `Result<A, E>`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, Result } from "effect"
 * 
 * const some = Result.fromOption(Option.some(1), () => "missing")
 * console.log(some)
 * // Output: { _tag: "Success", success: 1, ... }
 * 
 * const none = Result.fromOption(Option.none(), () => "missing")
 * console.log(none)
 * // Output: { _tag: "Failure", failure: "missing", ... }
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
const exportName = "fromOption";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Converts an `Option<A>` into a `Result<A, E>`.";
const sourceExample = "import { Option, Result } from \"effect\"\n\nconst some = Result.fromOption(Option.some(1), () => \"missing\")\nconsole.log(some)\n// Output: { _tag: \"Success\", success: 1, ... }\n\nconst none = Result.fromOption(Option.none(), () => \"missing\")\nconsole.log(none)\n// Output: { _tag: \"Failure\", failure: \"missing\", ... }";
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
