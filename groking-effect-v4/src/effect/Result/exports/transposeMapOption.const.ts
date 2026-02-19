/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: transposeMapOption
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:14:16.772Z
 *
 * Overview:
 * Maps an `Option` value with a `Result`-producing function, then transposes the structure from `Option<Result<B, E>>` to `Result<Option<B>, E>`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, Result } from "effect"
 * 
 * const parse = (s: string) =>
 *   isNaN(Number(s))
 *     ? Result.fail("not a number" as const)
 *     : Result.succeed(Number(s))
 * 
 * console.log(Result.transposeMapOption(Option.some("42"), parse))
 * // Output: { _tag: "Success", success: { _tag: "Some", value: 42 }, ... }
 * 
 * console.log(Result.transposeMapOption(Option.none(), parse))
 * // Output: { _tag: "Success", success: { _tag: "None" }, ... }
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
const exportName = "transposeMapOption";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Maps an `Option` value with a `Result`-producing function, then transposes the structure from `Option<Result<B, E>>` to `Result<Option<B>, E>`.";
const sourceExample = "import { Option, Result } from \"effect\"\n\nconst parse = (s: string) =>\n  isNaN(Number(s))\n    ? Result.fail(\"not a number\" as const)\n    : Result.succeed(Number(s))\n\nconsole.log(Result.transposeMapOption(Option.some(\"42\"), parse))\n// Output: { _tag: \"Success\", success: { _tag: \"Some\", value: 42 }, ... }\n\nconsole.log(Result.transposeMapOption(Option.none(), parse))\n// Output: { _tag: \"Success\", success: { _tag: \"None\" }, ... }";
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
